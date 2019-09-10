<template>
	<div>
		<v-card>
			<v-card-title>
				<div class="headline">Categories</div>
				<v-spacer></v-spacer>
				<v-text-field
				append-icon="search"
				label="Search category..."
				single-line
				hide-details
				v-model="search"
				></v-text-field>
				<v-btn icon dark class="red white--text" @click="$emit('deleteCategories')" :disabled="disableDeleteButton">
					<v-icon>delete_forever</v-icon>
				</v-btn>
			</v-card-title>
			<v-data-table
			v-model="selected"
			:headers="headers"
			:items="items"
			select-all
			:pagination.sync="pagination"
			item-key="name"
			class="elevation-1"
			:loading="loading"
			:search="search"
			:rows-per-page-items="rowsPerPageItems"
			>
			<template slot="headers" slot-scope="props">
				<tr>
					<th>
						<v-checkbox
						primary
						hide-details
						@click.native="toggleAll"
						:input-value="props.all"
						:indeterminate="props.indeterminate"
						color="pink"
						></v-checkbox>
					</th>
					<th
					v-for="header in props.headers"
					:key="header.text"
					:class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
					@click="changeSort(header.value)"
					>
					<v-icon small>arrow_upward</v-icon>
					{{ header.text }}
				</th>
			</tr>
		</template>
		<template slot="items" slot-scope="props">
			<tr :active="props.selected" @click="props.selected = !props.selected">
				<td>
					<v-checkbox
					primary
					hide-details
					:input-value="props.selected"
					color="pink"
					></v-checkbox>
				</td>
				<td class="text-xs-center pa-2">
					<v-avatar size="100px" tile>
						<v-img contain :src="props.item.downloadURL" :alt="props.item.name" :lazy-src="require('@/assets/no-image.png')">
							<v-layout slot="placeholder" fill-height align-center justify-center ma-0>
			                  <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
			                </v-layout>
						</v-img>
					</v-avatar>
				</td>
				<td class="text-xs-center">{{ props.item.name }}</td>
				<td class="text-xs-center">{{ props.item.totalProducts }}</td>
				<td class="text-xs-center">{{ props.item.createdAt | momentize('MMMM D, YYYY') }}</td>
				<td class="text-xs-center">
					<a @click.prevent="updatePosition(props.item)">{{ props.item.position }}</a>
				</td>
				<td class="text-xs-center">
					<v-tooltip left>
						<v-btn 
							icon 
							color="primary" 
							dark 
							@click.stop="view(props.item)"
							slot="activator"
						>
							<v-icon>remove_red_eye</v-icon>
						</v-btn>
						<span>View Products</span>
					</v-tooltip>

					<v-tooltip left>
						<v-btn 
							icon 
							color="primary" 
							dark 
							@click.stop="openEditDialog(props.item)"
							slot="activator"
						>
							<v-icon>edit</v-icon>
						</v-btn>
						<span>Edit Category Details</span>
					</v-tooltip>
					
					<v-tooltip left>
						<v-btn 
							icon 
							class="primary" 
							:loading="statusButtonLoading" 
							:disabled="statusButtonLoading" 
							@click.stop="changeStatus(props.item)"
							slot="activator"	
						>
							<v-icon v-if="props.item.active">archive</v-icon>
							<v-icon v-else>unarchive</v-icon>
						</v-btn>
						<span v-if="props.item.active === 1">Archive Category</span>
                		<span v-else>Unarchive Category</span>
					</v-tooltip>
				</td>
			</tr>
		</template>
	</v-data-table>
</v-card>
<sweet-modal :icon="modal.icon" ref="modal" blocking>
	{{modal.text}}
</sweet-modal>
<v-btn
color="primary"
dark
fab
bottom
right
fixed
@click="addCategoryDialog = true"
>
<v-icon>add</v-icon>
</v-btn>
<v-dialog max-width="500px" v-model="addCategoryDialog" persistent>
	<v-card>
		<v-card-title>
			<div class="title">Add category</div>
		</v-card-title>
		<v-card-text>
			<input type="file" ref="categoryFile" value="upload" accept=".png, .jpg, .jpeg" @change="validateFile">
			<v-text-field
			label="Name"
			v-model="newCategory.name"
			></v-text-field>
			<!-- <v-checkbox color="primary" label="This category is a promotion" v-model="newCategory.promotion"></v-checkbox> -->
		</v-card-text>
		<v-card-actions>
			<v-spacer></v-spacer>
			<v-btn flat @click.native="addCategoryDialog = false" :disabled="addCategoryButtonDisabled">Cancel</v-btn>
			<v-btn color="primary"
			class="white--text"
			:loading="addCategoryButtonDisabled"
			:disabled="addCategoryButtonDisabled"
			@click="addCategory">Save</v-btn>
		</v-card-actions>
	</v-card>
</v-dialog>

	<v-dialog max-width="300px" v-model="updatePositionDialog">
		<v-card>
			<v-card-title>
				<div class="title">Update Position</div>
			</v-card-title>
			<v-card-text>
				<v-select :items="positions" v-model="selectedPosition" label="Position"></v-select>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn flat @click.native="updatePositionDialog = false">Cancel</v-btn>
				<v-btn color="primary"
				@click="savePosition">Save</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<v-dialog>

	</v-dialog>
</div>
</template>

<script>
import mixins from '@/mixins';
import {DB, STORAGE} from '@/config/firebase';
const categoriesCollection = DB.collection('catalogues');
const productsCollection = DB.collection('products');
const storageRef = STORAGE.ref('appsell');

export default {
	props: ['items'],
	created () {
		this.loading = true;
	},
	data: () => ({
		pagination: {
			sortBy: 'name'
		},
		rowsPerPageItems: [10,20,30,{"text":"All","value":-1}],
		selected: [],
		headers: [
		{
			text: 'Thumbnail',
			align: 'center',
			sortable: false,
			value: 'downloadURL'
		},
		{
			text: 'Name',
			value: 'name'
		},
		{
			text: 'Total Products',
			value: 'totalProducts'
		},
		{
			text: 'Date added',
			value: 'createdAt'
		},
		{
			text: 'Display Position',
			value: 'position'
		},
		{
			text: 'Actions',
			sortable: false
		}
		],
		loading: false,
		search: null,
		showEdit: false,
		modal: {
			icon: null,
			text: null
		},
		saveButtonDisabled: false,
		addCategoryDialog: false,
		addCategoryButtonDisabled: false,
		newCategory: {
			name: null,
			promotion: false
		},
		statusButtonLoading: false,
		positions: [],
		selectedPosition: null,
		updatePositionDialog: false,
		selectedCategory: {},
		disableDeleteButton: true
	}),
	methods: {
		toggleAll () {
			if (this.selected.length) this.selected = []
				else this.selected = this.items.slice()
			},
		changeSort (column) {
			if (this.pagination.sortBy === column) {
				this.pagination.descending = !this.pagination.descending
			} else {
				this.pagination.sortBy = column
				this.pagination.descending = false
			}
		},
		notify (icon, text) {
			this.modal.icon = icon;
			this.modal.text = text;
			this.$refs.modal.open();
		},
		validateFile (el) {
			if (!el.target.value) {
				return;
			}

			const path = el.target.value;
			const idxDot = path.lastIndexOf('.') + 1;
        	const extFile = path.substr(idxDot, path.length).toLowerCase();

        	const acceptedFiles = ['jpg', 'jpeg', 'png'];

        	if (!acceptedFiles.includes(extFile)) {
        		this.$refs.categoryFile.value = '';
        		this.notify('error', 'Uploaded file is not an image.');
        	}
		},
		async addCategory () {
			if (!this.newCategory.name || this.$refs.categoryFile.files.length < 1) {
				return false;
			}

			const index = this.items.findIndex(i => i.name.toLowerCase() === this.newCategory.name.toLowerCase());

			if (index !== -1) {
				this.notify('error', 'Category name already exists.');
				return;
			}

			const file = this.$refs.categoryFile.files[0];
			const name = this.newCategory.name.trim();
			const metadata = { contentType: file.type };
			this.addCategoryButtonDisabled = true;

			try {
				const snapshot = await storageRef.child('catalogues/' + name).put(file, metadata);
				const downloadURL = await snapshot.ref.getDownloadURL();
				const newCategoryData = {
					active: 1,
					created: Date.now(),
					downloadURL: downloadURL,
					promotion: this.newCategory.promotion,
					name,
					pictureName: name,
					totalProducts: 0,
					position: this.items.length + 1
				};

				const response = await categoriesCollection.add(newCategoryData);

				newCategoryData.id = response.id;
				this.items.push(newCategoryData);
				console.log('new data', newCategoryData)
				this.addCategoryButtonDisabled = false;
				this.addCategoryDialog = false;

				this.notify('success', 'Category has been successfully added');
			} catch (error) {
				console.log(error);
				this.addCategoryButtonDisabled = false;
				this.addCategoryDialog = false;
				this.notify('error', 'An error occurred');
			}
		},
		changeStatus (item) {
			const r = confirm('Are you sure?');
			if (r) {
				this.statusButtonLoading = true;
				const active = item.active === 1 ? 0 : 1;
				const promise = categoriesCollection.doc(item.id).update({active});
				const text = item.active === 1 ? 'Category has been successfully archived' : 'Category has been successfully unarchived';
				promise.then(() => {
					const itemIndex = this.items.findIndex((i) => i.id === item.id);
					this.items[itemIndex].active = active;
					this.statusButtonLoading = false;
					this.notify('success', text);
				});
			}
		},
		view (item) {
			this.$router.push({name: 'ViewCategory', params: {
				id: item.id,
				data: item
			}});
		},
		updatePosition (item) {
			this.positions = [];

			this.selectedCategory = item;
			this.items.forEach((product, index) => {
				this.positions.push(index + 1);
			});

			this.updatePositionDialog = true;
		},
		async savePosition () {
			try {

				const index = this.items.findIndex(i => i.position === this.selectedPosition);

				const selectedCategoryClone = JSON.parse(JSON.stringify(this.selectedCategory));

				if (index === -1) {
					await categoriesCollection.doc(selectedCategoryClone.id).update({position: this.selectedPosition});
					const categoryIndex = this.items.findIndex(i => i.id === selectedCategoryClone.id);
					this.items[categoryIndex].position = this.selectedPosition;
				} else {
					await categoriesCollection.doc(selectedCategoryClone.id).update({position: this.selectedPosition});
					await categoriesCollection.doc(this.items[index].id).update({position: selectedCategoryClone.position});
					const categoryIndex = this.items.findIndex(i => i.id === selectedCategoryClone.id);
					this.items[categoryIndex].position = this.items[index].position;
					this.items[index].position = selectedCategoryClone.position;
				}

				this.notify('success', 'Display position updated');
				this.updatePositionDialog = false;

			} catch (error) {
				console.log(error);
			}
		}
	},
	watch: {
		addCategoryDialog (val) {
			if (!val) {
				this.newCategory.name = null;
			}
		},
		selected (arr) {
			this.disableDeleteButton = arr.length > 0 ? false : true;
		}
	},
	mixins: [mixins]
}
</script>
