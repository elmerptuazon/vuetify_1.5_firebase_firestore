<template>
	<v-container>
		<v-expansion-panel>
			<v-expansion-panel-content>
				<div slot="header" class="headline">Photos Upload</div>
				<v-card>
					<v-card-text>
						<vue-dropzone
						ref="dropzoneRef"
						id="dropzone"
						:options="dropzoneOptions"
						@vdropzone-file-added="fileAdded"
						@vdropzone-removed-file="fileRemoved"
						/>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="primary" dark @click.native="uploadImages">Upload</v-btn>
					</v-card-actions>
				</v-card>
			</v-expansion-panel-content>
		</v-expansion-panel>
		<sweet-modal :icon="modal.icon" ref="modal" :blocking="modal.blocking">
			{{modal.text}}
		</sweet-modal>
	</v-container>
</template>

<script>
import XLSX from 'xlsx';
import axios from 'axios';
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import {DB, STORAGE} from '@/config/firebase';
import { downScaleImage } from '@/helpers/helpers';
const productsCollection = DB.collection('products');
const companiesCollection = DB.collection('companies');
const categoriesCollection = DB.collection('catalogues');
const storageRef = STORAGE.ref('appsell');

export default {
	data: () => ({
		categories: [],
		category: {},
		dropzoneOptions: {
			autoProcessQueue: false,
			url: '/',
			acceptedFiles: 'image/*',
			addRemoveLinks: true
		},
		modal: {
			icon: null,
			text: null,
			blocking: false
		},
		excelFileUploadDone: false,
		images: []
	}),
	async created () {},
	methods: {
		
		fileAdded (file) {
			this.images.push(file);
		},
		fileRemoved (file) {
			console.log(file)
			const i = this.images.findIndex((image) => image.name === file.name);
			if (i >= 0) {
				this.images.splice(i, 1);
			}
		},
		async uploadImages () {

			const r = await this.$swal.fire({
				title: 'Are you sure?',
				text: 'All images will be added to products with the same code.',
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes',
				cancelButtonText: 'No',
				showCloseButton: true
			});

			if (!r.value) {
				return;
			}

			this.notify('warning', 'Upload in progress. Please dont close', true);
			try {
				await this.batchUpload();
				this.notify('success', 'Product images has been successfully uploaded');
			} catch (error) {
				this.notify('error','An error occurred.');
			}
		},
		async batchUpload () {
			try {
				const response = await this.checkImages();

				const products = [];

				for (const product of response) {
					if (product.found) {
						const productData = {
							pictureName: product.data.fileName,
							downloadURL: null
						}

						const rescaledImage = await downScaleImage(product.data.dataURL);
						const snapshot = await storageRef.child('products/' + product.data.fileName).putString(rescaledImage, 'data_url');
						const downloadURL = await snapshot.ref.getDownloadURL();
						productData.downloadURL = downloadURL;
						await productsCollection.doc(product.data.id).update(productData);
						products.push(productData);
					}
				}

				return products;
			} catch (error) {
				throw error;
			}
		},
		checkImages () {
			const dataURLs = [];
			this.images.forEach((image) => {
				const fileName = image.name.substring(0, image.name.lastIndexOf('.')) || image.name;
				dataURLs.push(
					productsCollection.where('code', '==', fileName).get()
					.then(productsSnapshot => {
						if (productsSnapshot.docs.length > 0) {
							const data = {
								id: productsSnapshot.docs[0].id,
								fileName,
								dataURL: image.dataURL,
								pictureName: fileName
							};
							return {
								found: true,
								data
							}
						} else {
							return {
								found: false
							}
						}
					})
					)
			});
			return Promise.all(dataURLs);
		},
		notify (icon, text, blocking=true) {
			this.modal = {
				icon,
				text,
				blocking
			};
			this.$refs.modal.open();
		}
	},
	components: {
		vueDropzone: vue2Dropzone
	}
}
</script>
