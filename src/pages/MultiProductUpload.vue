<template>
	<v-container>
		<v-expansion-panel>
			<v-expansion-panel-content>
				<div slot="header" class="headline">Excel File Upload</div>
				<div class="pa-4">
					<v-layout row>
						<v-flex xs12 sm12 md6 lg6 xl6>
							<input type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" ref="excelFile" value="upload" @change="validateFile"> <br><br>
							<v-btn @click.native="upload" class="primary white--text">Upload Excel File</v-btn>
						</v-flex>
					</v-layout>
				</div>
			</v-expansion-panel-content>
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
import 'vue2-dropzone/dist/vue2Dropzone.css'
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
		validateFile (el) {
			if (!el.target.value) {
				return;
			}

			const path = el.target.value;
			const idxDot = path.lastIndexOf('.') + 1;
			const extFile = path.substr(idxDot, path.length).toLowerCase();

			const acceptedFiles = ['xlsx', 'xls'];

			if (!acceptedFiles.includes(extFile)) {
				this.$refs.excelFile.value = '';
				this.notify('error', 'Uploaded file is invalid.');
			}
		},

		upload () {
			if (this.$refs.excelFile.files.length < 1) {
				this.notify('error', 'No excel file added', true)
				return;
			}

			this.$swal.fire({
				title: 'Are you sure?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes',
				cancelButtonText: 'No',
				showCloseButton: true
			}).then((r) => {
				if (r.value) {
					const file = this.$refs.excelFile.files[0];
					const objectURL = window.URL.createObjectURL(file);
					const promise = axios.get(objectURL, {
						responseType: 'arraybuffer'
					});
					promise.then((response) => {
						const data = new Uint8Array(response.data);
						const arr = new Array();
						for(let i = 0; i != data.length; ++i) {
							arr[i] = String.fromCharCode(data[i]);
						}
						const workbook = XLSX.read(arr.join(''), {type:'binary'});
						const worksheet = workbook.Sheets[workbook.SheetNames[0]];
						let products = XLSX.utils.sheet_to_json(worksheet, {raw:true});
						products = products.map((p) => {
					// const promotion = p.Promotion ? p.Promotion : 0;
					const percentage = p.Discount ? p.Discount : 0;
					const status = p.Sale ? true : false;
					const doc = {
						code: p.Code.toString().trim(),
						price: p.Price,
						resellerPrice: p.ResellerPrice || null,
						category: p.Category,
						createdAt: Date.now(),
						name: p.Name.trim(),
						description: p.Description || null,
						sale: {
							percentage,
							status
						},
						active: 1,
						attributes: []
					};

					if (p.Quantity) {
						const from = p.Quantity.split('-')[0];
						const to = p.Quantity.split('-')[1];
						doc.attributes.push({
							name: 'Quantity',
							items: Array.from({length: +to},(v,k)=> k + +from)
						});
					} else {
						doc.attributes.push({
							name: 'Quantity',
							items: Array.from({length:10},(v,k)=>k+1)
						});
					}

					// check for attributes
					const staticProperties = ['Code', 'Name', 'Price', 'ResellerPrice', 'Category', 'Description', 'Sale', 'Discount', 'Quantity'];

					for (let x = 0; x < Object.keys(p).length; x++) {
						const key = Object.keys(p)[x];
						if (!staticProperties.includes(key)) {
							doc.attributes.push({
								name: key,
								items: p[key].split(',')
							});
						}
					}

					return doc;
				});

						categoriesCollection.get()
						.then(async(querySnapshot) => {

							const categories = querySnapshot.docs.map(doc => {
								const data = doc.data();
								data.id = doc.id;
								return data;
							});

							products = products.map((product) => {
								const categoryIndex = categories.findIndex(c => c.name.toLowerCase() == product.category.toLowerCase());
								if (categoryIndex !== -1) {
									product.categoryId = categories[categoryIndex].id;
									delete product.category;
								}
								return product;
							});

							this.notify('warning', 'Upload in progress. Please dont close', true);
							this.batchCreate(products, categories);
						});
					});
				}
			})
		},


		async batchCreate (products, categories = []) {
			try {
				const batch = DB.batch();
				
				let promises = [];
				const existingProducts = [];
				products.forEach((product) => {
					promises.push(productsCollection.where('code', '==', product.code).limit(1).get()
					.then((docs)=>{
						if(docs.empty)
						{
							const ref = productsCollection.doc();
							batch.set(ref, product);
						}
						else
						{
							docs.forEach ((doc) =>{
							if (doc.id){
									batch.update(productsCollection.doc(doc.id), 
									{description: product.description,
									 price: product.price,
									 resellerPrice: product.resellerPrice,
									 name: product.name,
									 categoryId: product.categoryId,
									 attributes:product.attributes});
									//console.log(doc.data())
									//console.log(product)
									existingProducts.push(product.code);
							}
						})
						}
					})
					)
				});

				await Promise.all(promises);
				products = products.filter(product => !existingProducts.includes(product.code));
				categories.forEach((cat) => {
					const total = products.filter(p => p.categoryId === cat.id).length;
					if (total > 0) {
						categoriesCollection.doc(cat.id).update({totalProducts: total + cat.totalProducts});
					}
				});

				await batch.commit();
				this.excelFileUploadDone = true;
				this.notify('success', 'Products has been successfully uploaded');
			} catch (e) {
				console.log(e);
			}
		},
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
