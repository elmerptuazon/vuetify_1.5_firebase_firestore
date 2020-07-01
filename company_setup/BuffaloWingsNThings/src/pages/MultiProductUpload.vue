<template>
	<v-container>
		<v-expansion-panel>
			<v-expansion-panel-content>
				<div slot="header" class="headline">Add Multiple Products through Excel</div>
				<v-card>
					<v-card-text>
						<v-layout wrap row px-3>
							<v-flex xs12 my-3>
								<div class="mb-1 caption">
									<v-icon small>info</v-icon>
									<span class="font-italic"
									>the file upload only accepts a specified
									<a
										class="font-weight-bold"
										:href="excelDownloadURL"
										download="Category Excel Template"
										>excel template.</a
									></span
									>
								</div>
							</v-flex>
							<v-flex xs10>
								<input
									type="file"
									ref="excelFile"
									value="upload"
									placeholder="click me to upload the excel file..."
									accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
									@change="validateExcelFile"
								/>
							</v-flex>
						</v-layout>
					</v-card-text>
					<v-card-actions class="ma-3">
						<v-btn 
							color="primary" dark
						 	@click.native="uploadExcelFile"
						 	:loading="excelButtonLoading"
						 >Upload Excel File</v-btn
						>
					</v-card-actions>
				</v-card>
			</v-expansion-panel-content>
		</v-expansion-panel>

		<v-expansion-panel class="mt-5">
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
						<v-btn color="black" dark outline @click="removeAllPhotos" v-show="images.length">Remove all</v-btn>
						<v-btn class="ml-2" color="primary" dark @click.native="uploadImages">Upload</v-btn>
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
		images: [],
		excelButtonLoading: false,
		excelDownloadURL: null,
	}),
	async created() {
		this.excelDownloadURL = await this.$store.dispatch(
			"categories/GET_EXCEL_TEMPLATE"
		);
	},
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
		removeAllPhotos() {
			this.$refs.dropzoneRef.removeAllFiles(true);
			this.images = [];
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
				this.removeAllPhotos();
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
		},

		validateExcelFile(el) {
			if (!el.target.value) {
				return;
			}

			const path = el.target.value;
			const idxDot = path.lastIndexOf(".") + 1;
			const extFile = path.substr(idxDot, path.length).toLowerCase();

			const acceptedFiles = ["xlsx", "xls", "_xls", "_xlsx"];

			if (!acceptedFiles.includes(extFile)) {
				this.$refs.excelFile.value = "";
				this.$swal.fire({
					type: "error",
					title: "Error",
					text: "The uploaded file is not an excel file. Please try again."
				});
				return;
			}
		},

		async uploadExcelFile() {
			this.excelButtonLoading = true;
			if (!this.$refs.excelFile.files[0]) {
				this.$swal.fire({ type: "warning", title: "Choose a file first." });
				this.excelButtonLoading = false;
				return;
			}

			const answer = await this.$swal.fire({
				title: "Are you sure?",
				type: "warning",
				showCancelButton: true,
				confirmButtonText: "Yes",
				cancelButtonText: "No",
				showCloseButton: true
			});

			if (!answer.value) {
				this.excelButtonLoading = false;
				return;
			} 

			const categories = await this.$store.dispatch('categories/FETCH_ALL_CATEGORIES');

			const file = this.$refs.excelFile.files[0];
			const objectURL = window.URL.createObjectURL(file);
			const promise = await axios.get(objectURL, {
				responseType: "arraybuffer"
			});

			//Process Returned Reponse from Axios
			const data = new Uint8Array(promise.data);
			const arr = new Array();
			for (let i = 0; i != data.length; ++i) {
				arr[i] = String.fromCharCode(data[i]);
			}

			const workbook = XLSX.read(arr.join(""), { type: "binary" });

			//Cycle through each category on the excel file
			const sheetsLength = workbook.SheetNames.length;
			for (let i = 0; i != sheetsLength; i++) {
				let worksheet = workbook.Sheets[workbook.SheetNames[i]];
				let categoryName = workbook.SheetNames[i];

				//check if current category on excel is existing in the db
				const index = categories.findIndex(
					item => item.name === categoryName
				);
				let categoryData = {};

				if (index == -1) {
					categoryData = {
						name: categoryName,
						created: Date.now(),
						active: 1,
						totalProducts: 0,
						position: categories.length + 1 + i,
						pictureName: "",
						downloadURL: ""
					};

					const uploadedCategory = await this.$store.dispatch(
						"categories/ADD_CATEGORY",
						{
							categoryData: categoryData
						}
					);

					categoryData.id = uploadedCategory.id;
				} else {
					categoryData = categories[index];
					console.log("EXISTING CATEGORY: ", categoryData);
				}

				let productList = XLSX.utils.sheet_to_json(worksheet, { raw: true });

				productList = await productList.map(p => {

					return {
						active: 1,
						code: p.Code,
						name: p.Name,
						price: Number(p.Price),
						description: p.Description,
						weight: Number(p.Weight),
						attributes: [],
						isOutofStock: false,
						createdAt: Date.now(),
						categoryId: categoryData.id,
						category: categoryData.name,
						searchTerms: p.Name.split(" ").map(term => {
							return term.toLowerCase();
						})
					};
				});
				//console.log(`Current Category: ${currentCategory.categoryName} & Product List: ${productList}`);

				let totalProducts = 0;
				const productLength = productList.length;
				for (let i = 0; i < productLength; i++) {
					const product = productList[i];
					const exist = await this.$store.dispatch(
						"products/CheckIfProductExists",
						product
					);

					if (exist) {
						const snapshot = await productsCollection
							.where("code", "==", product.code)
							.limit(1)
							.get();
						const productId = snapshot.docs[0].id;
						console.log("EXISTING PRODUCT ID: ", productId);
						await this.$store.dispatch("products/UPDATE_PRODUCT", {
							productId: productId,
							productData: product
						});

					} else {
						await this.$store.dispatch("products/ADD_PRODUCT", {
							productData: product
						});
						totalProducts += 1;
					}
				}

				categoryData.totalProducts += totalProducts;

				await this.$store.dispatch("categories/UPDATE_CATEGORY", {
					categoryId: categoryData.id,
					categoryData: categoryData
				});
			}

			this.excelButtonLoading = false;

			this.$swal.fire({
			type: "info",
			title: "Success",
			text: "The Category and its Products has been uploaded successfully."
			});

			this.$refs.excelFile.value = null;
		},

	},
	components: {
		vueDropzone: vue2Dropzone
	}
}
</script>
