<template>
	<v-container>
		<v-card>
			<v-card-title>
				<v-btn icon @click="backToCategories">
					<v-icon>arrow_back</v-icon>
				</v-btn>
				<div class="headline">{{$route.params.data.name}}</div>
				<v-spacer></v-spacer>
				<!-- <v-btn class="grey darken-2 white--text" @click="archiveProducts" :disabled="disableActionButtons">
					<v-icon>archive</v-icon>
				</v-btn> -->
			</v-card-title>
		</v-card>
		<div class="mt-3"></div>
		<Products :categoryId="$route.params.id" :items="items" :category="category" ref="productsRef" @selected="toggleActionButtons"/>
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
import { mapState } from 'vuex';
import { downScaleImageFromFile } from '@/helpers/helpers';
const categoriesCollection = DB.collection('catalogues');
const productsCollection = DB.collection('products');
const storageRef = STORAGE.ref('appsell');

export default {
	data: () => ({
		category: {},
		//items: [],
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
	async created () {
		this.category = Object.assign({}, this.$route.params.data);
		await this.$store.dispatch('products/FETCH_PRODUCTS', this.category.id);
	},
	methods: {
		
		backToCategories () {
			this.$router.go(-1);
		},

		toggleActionButtons (data) {
			this.disableActionButtons = data.length > 0 ? false : true;
			this.disableActionButtons = data.length > 0 ? false : true;
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

			this.$swal.fire({
				type: "warning",
				title: "Warning!",
				text: "Batch archive in progress. Please dont close"
			});

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
				
				this.$swal.fire({
					type: "success",
					title: "Success!",
					text: "All selected products has been successfully archived"
				});
			} catch (error) {
				console.error(e);
				this.$swal.fire({
					type: "error",
					title: "Error!",
					text: "An error occurred"
				});
			}
		}
	},
	components: {
		Products
	},
	computed: {
		...mapGetters({
			'roles': 'auth/GET_ROLES'
		}),

		...mapState("products", {
			items: state => state.productsList
		})
	},
	mixins: [mixins]
}
</script>
