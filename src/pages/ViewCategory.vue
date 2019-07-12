<template>
	<v-container>
		<v-card>
			<v-card-title>
				<v-btn icon @click="backToCategories">
					<v-icon>arrow_back</v-icon>
				</v-btn>
				<div class="headline">{{$route.params.data.name}}</div>
				<v-spacer></v-spacer>
				<!--<v-btn icon class="red white--text" @click="deleteProducts" :disabled="disableActionButtons">
					<v-icon>delete_forever</v-icon>
				</v-btn>-->
				<v-btn icon class="grey darken-2 white--text" @click="archiveProducts" :disabled="disableActionButtons">
					<v-icon>archive</v-icon>
				</v-btn>
				<v-btn icon color="primary" @click.native="showEdit = !showEdit">
					<v-icon>{{ showEdit ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
				</v-btn>
			</v-card-title>
			<v-slide-y-transition>
				<div v-show="showEdit">
					<v-card-text>
						<div class="text-xs-center mb-3">
							<v-img :src="category.downloadURL" :alt="category.name" width="300" contain></v-img>
						</div>
						<v-layout row>
							<v-flex xs12 sm12 md6 lg6 xl6>
								<input type="file" ref="file" value="upload">
								<v-text-field
								placeholder="Category name"
								v-model="category.name"
								></v-text-field>
								<v-checkbox color="primary" label="This category is a promotion" v-model="category.promotion"></v-checkbox>
							</v-flex>
						</v-layout>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn flat @click.native="showEdit = false">Close</v-btn>
						<v-btn class="primary white--text" :disabled="saveButtonDisabled" :loading="saveButtonDisabled" @click.native="update">Save</v-btn>
					</v-card-actions>
				</div>
			</v-slide-y-transition>
		</v-card>
		<div class="mt-3"></div>
		<Products :categoryId="$route.params.id" :items="items" :category="category" ref="productsRef" @selected="toggleActionButtons" @itemUpdated="itemUpdated" />
		<sweet-modal :icon="modal.icon" ref="modal" :blocking="modal.blocking">
			{{modal.text}}
		</sweet-modal>
	</v-container>
</template>

<script>
import mixins from '@/mixins';
import {DB, STORAGE} from '@/config/firebase';
import Products from '@/components/Products';
import { mapGetters } from 'vuex';
import { downScaleImageFromFile } from '@/helpers/helpers';
const categoriesCollection = DB.collection('catalogues');
const productsCollection = DB.collection('products');
const storageRef = STORAGE.ref('appsell');

export default {
	data: () => ({
		category: {},
		items: [],
		loading: false,
		search: null,
		showEdit: false,
		modal: {
			icon: null,
			text: null,
			blocking: false
		},
		saveButtonDisabled: false,
		disableActionButtons: true
	}),
	created () {
		this.category = Object.assign({}, this.$route.params.data);
		this.fetchProducts().then((items) => {
			this.$refs.productsRef.loading = false;
			this.items = items;
		});
	},
	methods: {
		fetchProducts () {
			return new Promise((resolve) => {
				productsCollection
				.where('categoryId', '==', this.$route.params.id)
				.get()
				.then((productsSnapshot) => {
					const items = productsSnapshot.docs.map((doc) => {
						const data = doc.data();
						data.id = doc.id;
						return data;
					});
					resolve(items);
				});
			});
		},
		notify (icon, text, blocking=true) {
			this.modal.icon = icon;
			this.modal.text = text;
			this.modal.blocking = blocking;
			this.$refs.modal.open();
		},
		async update () {
			if (!this.category.name) {
				return;
			}

			try {

				if (this.$refs.file.files.length < 1) {
					await this.updateWithoutImage();
					return;
				}

				try {
					await storageRef.child('catalogues/' + this.category.pictureName).delete();
				} catch (e) {}

				this.saveButtonDisabled = true;

				const file = this.$refs.file.files[0];
				const name = this.category.name;

				const rescaledImage = await downScaleImageFromFile(file);
				const snapshot = await storageRef.child('catalogues/' + name).putString(rescaledImage, 'data_url');
				const downloadURL = await snapshot.ref.getDownloadURL();
				const newData = {
					name: this.category.name,
					promotion: this.category.promotion,
					totalProducts: this.items.length,
					downloadURL: downloadURL,
					pictureName: this.category.name
				}

				await categoriesCollection.doc(this.$route.params.data.id).update(newData);

				this.$route.params.data.name = this.category.name;
				this.category.pictureName = this.category.name;
				this.category.downloadURL = downloadURL;
				this.saveButtonDisabled = false;
				this.notify('success', 'Category has been successfully updated');

			} catch (error) {
				this.notify('error', 'An error occurred');
				console.log(error);
			}
		},
		async updateWithoutImage () {
			if (!this.category.name) {
				return;
			}

			const newData = {
				name: this.category.name,
				totalProducts: this.items.length,
				promotion: this.category.promotion
			};

			this.saveButtonDisabled = true;

			try {
				await categoriesCollection.doc(this.$route.params.data.id).update(newData);
				this.$route.params.data.name = this.category.name;
				this.saveButtonDisabled = false;
				this.notify('success', 'Category has been successfully updated');
				return;
			} catch (error) {
				console.error(e);
				this.notify('error', 'An error occurred');
			}
		},

		itemUpdated (item) {
			console.log(item);
			const i = this.items.findIndex(item => item.id === item.id);
			console.log(i)
			if (i !== -1) {
				this.items[i].photos = item.photos;
				console.log(this.items[i])
			}
		},
		
		backToCategories () {
			this.$router.go(-1);
		},

		toggleActionButtons (data) {
			this.disableActionButtons = data.length > 0 ? false : true;
			this.disableActionButtons = data.length > 0 ? false : true;
		},

		async deleteProducts () {

			const items = this.$refs.productsRef.selected;

			const c = confirm('Are you sure you want to delete selected products?');

			if (!c) {
				return;
			}

			try {

				this.notify('warning', 'Batch delete in progress. Please dont close');

				for (const item of items) {
					try {
						await productsCollection.doc(item.id).delete();
						this.category.totalProducts--;
						await STORAGE.refFromURL(item.downloadURL).delete();
						await this.$store.dispatch('categories/UPDATE_CATEGORY_BY_KEY', {
							categoryId: this.category.id,
							key: 'totalProducts',
							value: this.category.totalProducts
						});
						const index = this.items.findIndex(i => i.id === item.id);
						if (index !== -1) {
							this.items.splice(index, 1);
						}
						this.$refs.productsRef.selected = [];
					} catch (error) {
						continue;
					}
				}

				this.notify('success', 'All selected products has been successfully removed');
			} catch (error) {
				console.log(error);
				this.notify('error', 'An error occurred');
			}
		},

		async archiveProducts () {
			const items = this.$refs.productsRef.selected;

			const result = await this.$swal.fire({
	          title: 'Are you sure?',
	          text: 'All selected items will be archived and hidden from the app.',
	          type: 'warning',
	          showCancelButton: true,
	          confirmButtonText: 'Yes',
	          cancelButtonText: 'No',
	          showCloseButton: true
	        });

	        if (!result.value) {
	        	return;
	        }

			this.notify('warning', 'Batch archive in progress. Please dont close');

			try {
				const batch = DB.batch();

				items.forEach((product) => {
					const ref = productsCollection.doc(product.id);
					batch.update(ref, { active: 0 });
				});

				await batch.commit();

				items.forEach((product) => {
					const i = this.items.findIndex(item => item.id === product.id);
					this.items[i].active = 0;
				});

				this.$refs.productsRef.selected = [];
				this.notify('success', 'All selected products has been successfully archived');
			} catch (error) {
				console.error(e);
				this.notify('error', 'An error occurred');
			}
		}
	},
	components: {
		Products
	},
	computed: {
		...mapGetters({
			'roles': 'auth/GET_ROLES'
		})
	},
	mixins: [mixins]
}
</script>
