<template>
  <div>
    <v-card>
      <v-card-title>
        <v-layout row align-baseline justify-start wrap>
          <v-flex md2 align-content-end>
            <div class="headline">Products</div>
          </v-flex>

          <v-flex md6 xs10>
            <v-text-field
              append-icon="search"
              label="Search a product..."
              hide-details
              v-model="search"
            ></v-text-field>
          </v-flex>

          <v-flex
            md2
            :class="{
              'mt-4': $vuetify.breakpoint.smAndDown,
              'offset-md1': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-btn dark class="primary white--text" @click="OpenDialog">
              <v-icon class="mr-2">add</v-icon>
              <span>Add Product</span>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-title>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="items"
        select-all
        :pagination.sync="pagination"
        item-key="name"
        class="elevation-1"
        :loading="items.length === 0"
        :search="search"
        :rows-per-page-items="rowsPerPageItems"
      >
        <template slot="headers" slot-scope="props">
          <tr>
            <!-- <th>
              <v-checkbox
                primary
                hide-details
                @click.native="toggleAll"
                :input-value="props.all"
                :indeterminate="props.indeterminate"
                color="pink"
              ></v-checkbox>
            </th> -->
            <th
              v-for="header in props.headers"
              :key="header.text"
              :class="[
                'column sortable',
                pagination.descending ? 'desc' : 'asc',
                header.value === pagination.sortBy ? 'active' : ''
              ]"
              @click="changeSort(header.value)"
            >
              <v-icon small>arrow_upward</v-icon>
              {{ header.text }}
            </th>
          </tr>
        </template>
        <template slot="items" slot-scope="props">
          <tr
            :active="props.selected"
            @click="props.selected = !props.selected"
            v-bind:class="[props.item.active != 1 ? 'grey--text' : '']"
          >
            <!-- <td>
              <v-checkbox
                primary
                hide-details
                :input-value="props.selected"
                color="pink"
              ></v-checkbox>
            </td> -->
            <td class="text-xs-center pa-2">
              <v-avatar size="100px" tile>
                <v-img
                  contain
                  :src="props.item.downloadURL"
                  :alt="props.item.name"
                  :lazy-src="require('@/assets/no-image.png')"
                >
                  <v-layout
                    slot="placeholder"
                    fill-height
                    align-center
                    justify-center
                    ma-0
                  >
                    <v-progress-circular
                      indeterminate
                      color="grey lighten-5"
                    ></v-progress-circular>
                  </v-layout>
                </v-img>
              </v-avatar>
            </td>
            <td class="text-xs-center">
              {{ props.item.name }}
              <span v-if="props.item.active != 1"> (Archived)</span>
            </td>
            <td class="text-xs-center">
              {{ props.item.createdAt | momentize("MMMM D, YYYY") }}
            </td>
            <td class="text-xs-center">
              <v-tooltip left>
                <v-btn
                  slot="activator"
                  icon
                  class="primary white--text"
                  @click.stop="viewItemDetails(props.item)"
                >
                  <v-icon>edit</v-icon>
                </v-btn>
                <span>Edit Product Details</span>
              </v-tooltip>

              <v-tooltip left>
                <v-btn
                  slot="activator"
                  icon
                  dark
                  class="primary white--text"
                  @click.stop="openUploadImagesDialog(props.item)"
                >
                  <v-icon>add_photo_alternate</v-icon>
                </v-btn>
                <span>Add Product Photo Variants</span>
              </v-tooltip>

              <v-tooltip left>
                <v-btn
                  slot="activator"
                  icon
                  class="primary white--text"
                  :loading="statusButtonLoading"
                  :disabled="statusButtonLoading"
                  @click.stop="changeStatus(props.item)"
                >
                  <v-icon v-if="props.item.active">archive</v-icon>
                  <v-icon v-else>unarchive</v-icon>
                </v-btn>
                <span v-if="props.item.active === 1">Archive product</span>
                <span v-else>Unarchive product</span>
              </v-tooltip>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
    <sweet-modal :icon="modal.icon" ref="modal" blocking>
      {{ modal.text }}
    </sweet-modal>

    <v-dialog max-width="500px" v-model="addProductDialog" persistent>
      <v-card>
        <v-card-title>
          <div class="title">{{ dialogText }}</div>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            Product Thumbnail
            <br />
            <input
              type="file"
              ref="productFile"
              value="upload"
              accept=".png, .jpg, .jpeg"
              @change="validateFile"
            />
            <v-avatar v-if="product.downloadURL" size="100px" tile>
              <v-img
                contain
                :src="product.downloadURL"
                :alt="product.name"
                :lazy-src="require('@/assets/no-image.png')"
              >
                <v-layout
                  slot="placeholder"
                  fill-height
                  align-center
                  justify-center
                  ma-0
                >
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  ></v-progress-circular>
                </v-layout>
              </v-img>
            </v-avatar>
            <v-text-field
              label="Product Code*"
              :rules="basicRules"
              v-model="product.code"
              :disabled="
                product.code !== '' && dialogText === 'Edit Product Details'
              "
            ></v-text-field>
            <v-text-field
              label="Name*"
              :rules="basicRules"
              v-model="product.name"
            ></v-text-field>
            <v-textarea
              label="Description*"
              :rules="basicRules"
              v-model="product.description"
            ></v-textarea>
            <v-text-field
              label="Price*"
              :rules="decimalOnlyRules"
              v-model="product.price"
            ></v-text-field>
            <v-text-field
              label="Reseller Price*"
              :rules="decimalOnlyRules"
              v-model="product.resellerPrice"
            ></v-text-field>
            <v-text-field
              label="Percentage"
              v-model="product.sale.percentage"
              v-show="product.sale.status"
            ></v-text-field>
            <v-checkbox
              v-model="product.isOutofStock"
              :label="'Out of stock?'"
            ></v-checkbox>

            <v-divider class="mt-3"/> 
            <div class="font-weight-bold my-3 suheading">Product Attributes</div>
            
            <v-layout row v-if="!product.attributes.length" px-3>
              <p class="font-italic text-center">There is no attributes in this products</p>
            </v-layout>

            <v-layout row wrap v-else v-for="(attrib, index) in product.attributes" :key="attrib.name" align-center justify-center px-3>
              <v-flex xs4 pl-2>
                <div class="font-weight-bold caption">{{ attrib.name }}</div>
              </v-flex>
              <v-flex xs4>
                <div class="caption" v-for="item in attrib.items" :key="item">{{ item }}</div>
              </v-flex>
              <v-flex xs4>
                <v-tooltip left>
                  <v-btn
                    slot="activator"
                    icon
                    class="primary white--text"
                    @click.stop="deleteAttribute(index)"
                  >
                    <v-icon>delete</v-icon>
                  </v-btn>
                  <span>Delete Attribute</span>
                </v-tooltip>
                <v-tooltip right>
                  <v-btn
                    slot="activator"
                    icon
                    class="primary white--text"
                    @click.stop="editAttribute(index)"
                  >
                    <v-icon>edit</v-icon>
                  </v-btn>
                  <span>Edit Attribute</span>
                </v-tooltip>
              </v-flex>
              <v-flex xs12>
                <v-divider class="my-2 primary"/>
              </v-flex>
            </v-layout>

            <v-layout row wrap align-center justify-end mt-1 pa-3>
              <v-flex xs12 mb-1>
                <div class="font-weight-bold">Add Product Attribute</div>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  label="Attribute Name"
                  placeholder="Ex: Color, Weight, Size, etc..."
                  v-model="tempAttribName"
                ></v-text-field>
              </v-flex>

              <v-flex xs12>
                <v-text-field
                  label="Attribute Item"
                  placeholder="Seperate each item with a comma. Ex: Blue, Red"
                  v-model="tempAttribItems"
                ></v-text-field>
              </v-flex>
              
              <v-flex xs12>
                <v-btn
                  v-if="showEditConfirmButton"
                  block 
                  small 
                  color="secondary" 
                  depressed 
                  :disabled="!tempAttribName || !tempAttribItems" 
                  @click="confirmEditProductAttribute"
                >
                  Confirm Edit on Product Attribute
                </v-btn>

                <v-btn 
                  v-else
                  block 
                  small 
                  color="primary" 
                  depressed 
                  :disabled="!tempAttribName || !tempAttribItems" 
                  @click=" addProductAttribute"
                >
                  Add Product Attribute
                </v-btn>
              </v-flex>
                
            </v-layout>
            
            <v-flex xs12 my-2><v-divider/></v-flex>

          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            flat
            @click.prevent="closeProductDialog"
            :disabled="addProductButtonDisabled"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            class="white--text"
            :loading="addProductButtonDisabled"
            :disabled="addProductButtonDisabled"
            @click="saveProduct"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog max-width="800" v-model="uploadImagesDialog" persistent>
      <v-card>
        <v-card-title class="primary white--text headline">
          <div>Upload Photos</div>
          <v-spacer></v-spacer>
          <v-btn color="white" @click="uploadImagesDialog = false" flat icon>
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <p class="text-center font-italic">
            *Images will be seen in the carousel*
          </p>
          <v-layout v-if="!selectedProduct.photos" row my-3>
            <div class="subheading font-italic grey--text darken-2">
              *No Product Pictures Yet..*
            </div>
          </v-layout>

          <v-layout v-else row wrap align-baseline justify-start mb-3>
            <v-flex
              xs4
              v-for="(image, index) in selectedProduct.photos"
              :key="index"
              mt-3
            >
              <v-card width="210px">
                <v-img :src="image" />
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <!-- <v-spacer/> -->

                  <v-btn
                    small
                    class="error"
                    dark
                    @click="deleteImgVariant(index)"
                  >
                    <v-icon>delete_forever</v-icon>
                    <span>Delete</span>
                  </v-btn>

                  <!-- <v-btn small class="primary" dark><v-icon>zoom_in</v-icon><span>Enlarge</span></v-btn> -->
                </v-card-actions>
              </v-card>
            </v-flex>
          </v-layout>
          <v-divider />
          <v-layout row align-center justify-center mt-4>
            <v-flex xs12>
              <vue-dropzone
                ref="dropzoneRef"
                id="dropzone"
                duplicateCheck
                :options="dropzoneOptions"
                @vdropzone-file-added="fileAdded"
                @vdropzone-removed-file="fileRemoved"
                @vdropzone-duplicate-file="showDuplicateImage"
                @vdropzone-error="ErrorInUpload"
              />
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            flat
            color="grey darken-2"
            @click="
              uploadImagesDialog = false;
              uploadLoading = false;
            "
            >CANCEL
          </v-btn>
          <v-btn
            color="primary"
            :loading="uploadLoading"
            :disabled="uploadLoading || !images.length"
            @click.stop="upload"
            >Upload</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import mixins from "@/mixins";
import vue2Dropzone from "vue2-dropzone";
import "vue2-dropzone/dist/vue2Dropzone.min.css";
import { DB, STORAGE } from "@/config/firebase";
import { downScaleImageFromFile } from "@/helpers/helpers";
import { mapState } from "vuex";
const productsCollection = DB.collection("products");
const storageRef = STORAGE.ref("appsell");
const uuidv4 = require("uuid/v4");

export default {
  props: ["items", "categoryId", "category"],
  async created() {
    //this.loading = true;
    //await this.$store.dispatch("products/FETCH_PRODUCTS", this.categoryId);
    //this.items = this.$store.getters["products/GetProductsList"];
  },
  data: () => ({
    pagination: {
      sortBy: "name"
    },
    rowsPerPageItems: [10, 20, 30, { text: "All", value: -1 }],
    selected: [],
    headers: [
      {
        text: "Thumbnail",
        align: "center",
        sortable: false,
        value: "downloadURL"
      },
      {
        text: "Name",
        value: "name"
      },
      {
        text: "Date added",
        value: "createdAt"
      },
      {
        text: "Actions",
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
    addProductDialog: false,
    addProductButtonDisabled: false,
    newProduct: {
      name: null,
      description: null,
      sale: {
        status: false,
        percentage: null
      },
      promotion: false
    },
    statusButtonLoading: false,
    selectedProduct: {},
    uploadImagesDialog: false,
    uploadLoading: false,
    product: {
      code: null,
      name: null,
      description: null,
      sale: {
        status: false,
        percentage: null
      },
      price: null,
      resellerPrice: null,
      promotion: false,
      downloadURL: null,
      isOutofStock: null,
      id: null,
      attributes: [],
    },

    tempAttribName: null,
    tempAttribItems: null,
    showEditConfirmButton: false,
    productIndex: null,
    
    addProductDialog: false,
    dialogText: null,
    addProductButtonDisabled: false,
    dropzoneOptions: {
      autoProcessQueue: false,
      url: "/",
      acceptedFiles: "image/*",
      addRemoveLinks: true
    },
    images: []
  }),
  methods: {
    toggleAll() {
      if (this.selected.length) this.selected = [];
      else this.selected = this.items.slice();
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    },
    notify(icon, text) {
      this.modal.icon = icon;
      this.modal.text = text;
      this.$refs.modal.open();
    },
    OpenDialog() {
      this.dialogText = "Add New Product";
      this.addProductDialog = true;
      this.product.name = null;
      this.product.code = null;
      this.product.description = null;
      this.product.price = null;
      this.product.resellerPrice = null;
      this.product.downloadURL = null;
      this.product.name = null;
      this.product.isOutofStock = null;
      this.$refs.productFile.files.value = null;
    },
    async viewItemDetails(item) {
      this.dialogText = "Edit Product Details";
      this.addProductDialog = true;
      this.product.name = item.name;
      this.product.code = item.code;
      this.product.description = item.description;
      this.product.price = item.price;
      this.product.resellerPrice = item.resellerPrice;
      this.product.downloadURL = item.downloadURL;
      this.product.pictureName = item.pictureName;
      this.product.id = item.id;
      this.product.isOutofStock = item.isOutofStock;
      this.product.attributes = item.attributes || [];
      this.$refs.productFile.files.value = null;
    },
    addProductAttribute() {  
      this.product.attributes.push(
        {
          name: this.tempAttribName, 
          items: this.tempAttribItems.split(', ')
        }
      );

      this.tempAttribName = null;
      this.tempAttribItems = null;

      console.log(this.product.attributes);
    },

    editAttribute(index) {
      this.tempAttribName = this.product.attributes[index].name;
      this.tempAttribItems = this.product.attributes[index].items.join(', ');
      this.showEditConfirmButton = true;
      this.productIndex = index;

      console.log(this.product.attributes);
    },

    confirmEditProductAttribute() {
      this.product.attributes[this.productIndex].name = this.tempAttribName;
      this.product.attributes[this.productIndex].items = this.tempAttribItems.split(', ');
      this.showEditConfirmButton = false;
      this.productIndex = null;

      this.tempAttribName = null;
      this.tempAttribItems = null;

      console.log(this.product.attributes);
    },
    async deleteAttribute(index) {
      const r = await this.$swal.fire({
        title: "Warning!",
        text: `Are you sure you want to delete "${this.product.attributes[index].name}" attribute?`,
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        showCloseButton: true
      });

      if (r.value) {
        this.product.attributes.splice(index, 1);
      }
    },
    closeProductDialog() {
      this.$refs.productFile.value = null;
      this.addProductDialog = false;
    },
    async saveProduct() {
      this.addProductButtonDisabled = true;
      if (!this.$refs.form.validate()) {
        this.notify("Sorry", "One or more mandatory fields are required");
        this.addProductButtonDisabled = false;
        return;
      }
      //Adding a New Product
      if (this.dialogText == "Add New Product") {
        if (this.$refs.productFile.files.length === 0) {
          //this.notify("Sorry", "Product image is required.");
          this.$swal.fire({
            type: "warning",
            title: "Sorry",
            text: "Product image is required."
          });
          this.addProductButtonDisabled = false;
          return;
        }

        const exists = await this.$store.dispatch(
          "products/CheckIfProductExists",
          {
            categoryId: this.category.id,
            code: this.product.code
          }
        );

        if (exists) {
          //this.notify("Sorry", "Product Code is already existing in the database");
          this.$swal.fire({
            type: "error",
            title: "Sorry",
            text: "Product Code is already existing in the database"
          });
          this.addProductButtonDisabled = false;
          return;
        } else {
          this.addProductButtonDisabled = true;

          const newProduct = {
            active: 1,
            categoryId: this.categoryId,
            code: this.product.code,
            createdAt: Date.now(),
            description: this.product.description,
            name: this.product.name,
            price: this.product.price,
            resellerPrice: this.product.resellerPrice,
            //promotion: this.product.promotion,
            sale: this.product.sale,
            isOutofStock: this.product.isOutofStock || null,
            //uid: null
            attributes: this.product.attributes
          };
          console.log(newProduct);

          //try-catch block for saving productData to database
          try {
            const productId = await this.$store.dispatch(
              "products/ADD_PRODUCT",
              {
                productData: newProduct
              }
            );
            newProduct.id = productId;

            this.category.totalProducts++;

            await this.$store.dispatch("categories/UPDATE_CATEGORY", {
              categoryId: this.categoryId,
              categoryData: this.category
            });
          } catch (error) {
            console.log(error.message);
            this.$swal.fire({
              type: "error",
              title: "Error",
              text: error.message
            });
            //this.notify("error", error.message);
            return;
          }

          // try-catch block for uploading product image
          try {
            const file = this.$refs.productFile.files[0];
            const metadata = { contentType: file.type };

            const snapshot = await storageRef
              .child("products/" + newProduct.id)
              .put(file, metadata);
            const downloadURL = await snapshot.ref.getDownloadURL();
            newProduct.pictureName = newProduct.id;
            newProduct.downloadURL = downloadURL;
          } catch (error) {
            console.log(error);
            this.addProductButtonDisabled = false;
            this.addProductDialog = false;
            //this.notify("error", "An error occurred");
            this.$swal.fire({
              type: "error",
              title: "Error",
              text: "An error occurred!"
            });
          }

          await this.$store.dispatch("products/UPDATE_PRODUCT", {
            productId: newProduct.id,
            productData: newProduct
          });

          //this.items = this.$store.getters["products/GetProductsList"];
          //this.items.push(productData);

          this.addProductButtonDisabled = false;
          this.addProductDialog = false;
          this.$refs.productFile.value = null;
          //this.notify("success", "Product has been successfully added");
          this.$swal.fire({
            type: "success",
            title: "Success",
            text: "Product has been successfully added!"
          });
        }

        //Edit Product Details
      } else {
        this.addProductButtonDisabled = true;

        //try-catch block for saving productData to database
        const updatedProductData = {
          active: 1,
          categoryId: this.categoryId,
          code: this.product.code,
          description: this.product.description,
          name: this.product.name,
          price: this.product.price,
          resellerPrice: this.product.resellerPrice,
          //promotion: this.product.promotion,
          sale: this.product.sale,
          isOutofStock: this.product.isOutofStock || null,
          //uid: null
          downloadURL: this.product.downloadURL,
          pictureName: this.product.pictureName,
          id: this.product.id,
          attributes: this.product.attributes,
        };
        console.log("EDIT PRODUCT DETAILS: ", updatedProductData);

        if (this.$refs.productFile.files.length > 0) {
          try {
            storageRef
              .child("products/" + updatedProductData.id)
              .delete()
              .then(() => {
                console.log("Previous product photo has been deleted");
              })
              .catch(error => {
                console.log(error.message);
              });

            const file = this.$refs.productFile.files[0];
            const metadata = { contentType: file.type };

            const snapshot = await storageRef
              .child("products/" + updatedProductData.id)
              .put(file, metadata);
            const downloadURL = await snapshot.ref.getDownloadURL();
            updatedProductData.pictureName = updatedProductData.id;
            updatedProductData.downloadURL = downloadURL;
          } catch (error) {
            console.log(error);
            this.addProductButtonDisabled = false;
            this.addProductDialog = false;
            //this.notify("error", "An error occurred");
            this.$swal.fire({
              type: "error",
              title: "Error",
              text: "An error occurred."
            });
            return;
          }
        }
        //send productData to DB for product update
        await this.$store.dispatch("products/UPDATE_PRODUCT", {
          productId: updatedProductData.id,
          productData: updatedProductData
        });

        //this.items = this.$store.getters["products/GetProductsList"];
        // const index = this.items.findIndex(item => item.id === productData.id);
        // this.items[index] = productData;
        // this.items[index].downloadURL = productData.downloadURL;
        // this.items[index].pictureName = productData.pictureName;
        //console.log(this.items);

        this.addProductButtonDisabled = false;
        this.addProductDialog = false;
        //this.notify("success", "Product has been successfully updated");
        this.$swal.fire({
          type: "success",
          title: "Success",
          text: "Product has been successfully updated."
        });
      }
    },

    async changeStatus(item) {
      let text = "";
      if (item.active === 1) {
        text = "Item will be archived and hidden in the app.";
      } else {
        text = "Item will be activated and will appear in the app";
      }

      const r = await this.$swal.fire({
        title: "Are you sure?",
        text: text,
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        showCloseButton: true
      });

      if (!r.value) {
        return;
      }

      this.statusButtonLoading = true;
      const active = item.active === 1 ? 0 : 1;
      const successMessage =
        item.active === 1
          ? "Product has been successfully archived"
          : "Product has been successfully unarchived";
      try {
        await productsCollection.doc(item.id).update({ active });
        const itemIndex = this.items.findIndex(i => i.id === item.id);
        this.items[itemIndex].active = active;
        this.statusButtonLoading = false;
        //this.notify("success", successMessage);
        this.$swal.fire({
          type: "success",
          title: "Success",
          text: successMessage
        });
      } catch (error) {
        console.log(error);
        //this.notify("error", "An error occurred");
        this.$swal.fire({
          type: "error",
          title: "Error",
          text: "An error occurred"
        });
      }
    },

    openUploadImagesDialog(product) {
      this.selectedProduct = product;
      this.uploadImagesDialog = true;
      console.log(product);
    },

    fileAdded(file) {
      this.images.push(file);
    },

    fileRemoved(file) {
      console.log(file);
      const i = this.images.findIndex(image => image.name === file.name);
      if (i >= 0) {
        this.images.splice(i, 1);
      }
    },

    showDuplicateImage(file) {
      console.log("Duplicate image added");
      this.notify(
        "warning",
        `"${file.name}" already exists, please try again.`
      );
      this.fileRemoved(file);
      this.$refs.dropzoneRef.removeFile(file);
    },

    ErrorInUpload(file) {
      if (file.accepted === false) {
        this.notify(
          "warning",
          `"${file.name}" is an invalid file. Please upload images only.`
        );
      } else
        this.notify(
          "warning",
          "Error was encountered during the upload. Please try again."
        );
      console.log(file.status);

      this.$refs.dropzoneRef.removeFile(file);
    },

    async upload() {
      //const files = this.$refs.file.files;
      this.uploadLoading = true;
      let files = this.images;
      const uploads = [];

      const product = this.selectedProduct;

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const rescaledImage = await downScaleImageFromFile(file);
        await uploads.push(
          storageRef
            .child(`variants/${product.id}/${uuidv4()}`)
            .putString(rescaledImage, "data_url")
            .then(snapshot => {
              return snapshot.ref
                .getDownloadURL()
                .then(downloadURL => downloadURL);
            })
            .catch(error => {
              this.notify("error", error.message);
              this.uploadLoading = false;
            })
        );
      }

      this.uploadLoading = true;

      try {
        const res = await Promise.all(uploads);

        if (product.hasOwnProperty("photos")) {
          const photos = [...product.photos, ...res];
          product.photos = photos;

          //await productsCollection.doc(product.id).update({ photos: photos });
          await this.$store.dispatch("products/UPDATE_PRODUCT", {
            productId: product.id,
            productData: product
          });
          console.log("photos", photos);
          this.$emit("itemUpdated", {
            id: product.id,
            photos
          });
          //this.selectedProduct.photos = photos;
        } else {
          //console.log("res", res);
          //await productsCollection.doc(product.id).update({ photos: res });
          product.photos = res;
          await this.$store.dispatch("products/UPDATE_PRODUCT", {
            productId: product.id,
            productData: product
          });
          //this.selectedProduct.photos = res;
          this.$emit("itemUpdated", {
            id: product.id,
            photos: res
          });
        }
        //this.notify("success", "Variant images has been successfully uploaded");
        this.$swal.fire({
          type: "success",
          title: "Success",
          text: "Variant images has been successfully uploaded!"
        });

        this.uploadImagesDialog = false;
        this.uploadLoading = false;
        this.images = [];
        this.$refs.dropzoneRef.removeAllFiles(true);
      } catch (error) {
        //this.notify("error", error.message);
        this.$swal.fire({
          type: "error",
          title: "Error",
          text: error.message
        });
        console.log(error);
        this.uploadLoading = false;
      }
    },

    async deleteImgVariant(index) {
      const response = await this.$swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this photo?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        showCloseButton: true
      });

      if (response.value) {
        //this.notify("warning", "Deleting Image, please do not close this dialog.");
        this.$swal.fire({
          type: "warning",
          title: "WARNING",
          text: "Deleting Image, please do not close this dialog."
        });

        let images = this.selectedProduct.photos;
        const imgPath = await STORAGE.refFromURL(images[index]);
        console.log(imgPath);
        console.log("TO BE DELETE: ", imgPath.name);

        try {
          await storageRef
            .child(`variants/${this.selectedProduct.id}/${imgPath.name}`)
            .delete();
          images.splice(index, 1);
          this.selectedProduct.photos = images;
          //await productsCollection.doc(this.selectedProduct.id).update({ photos: images });
          await this.$store.dispatch("products/UPDATE_PRODUCT", {
            productId: this.selectedProduct.id,
            productData: this.selectedProduct
          });

          //this.notify("success", "Image has been deleted!");
          this.$swal.fire({
            type: "success",
            title: "Success",
            text: "Image has been deleted!"
          });
        } catch (error) {
          //this.notify("error", error.message);
          this.$swal.fire({
            type: "error",
            title: "Error",
            text: error.message
          });
          return;
        }
      }
    },

    view(item) {
      this.$router.push({
        name: "ViewCategory",
        params: {
          id: this.categoryId,
          data: item
        }
      });
    },

    validateFile(el) {
      if (!el.target.value) {
        return;
      }

      const path = el.target.value;
      const idxDot = path.lastIndexOf(".") + 1;
      const extFile = path.substr(idxDot, path.length).toLowerCase();

      const acceptedFiles = ["jpg", "jpeg", "png"];

      if (!acceptedFiles.includes(extFile)) {
        this.$refs.categoryFile.value = "";
        this.notify("error", "Uploaded file is not an image.");
      }
    }
  },
  watch: {
    addProductDialog(val) {
      if (!val) {
        this.newProduct = {
          name: null,
          sale: {
            status: false,
            percentage: null
          },
          promotion: false
        };
      }
    },
    selected(val) {
      this.$emit("selected", val);
    }
  },
  mixins: [mixins],
  computed: {
    // ...mapState("products", {
    //   items: state => state.productsList
    // })
  },
  components: {
    vueDropzone: vue2Dropzone
  }
};
</script>
