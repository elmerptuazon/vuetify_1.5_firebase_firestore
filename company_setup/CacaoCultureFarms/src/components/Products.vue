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
        item-key="name"
        select-all
        :pagination.sync="pagination"
        class="elevation-1"
        :loading="items.length === 0"
        :search="search"
        :rows-per-page-items="rowsPerPageItems"
      >
        <template slot="headers" slot-scope="props">
          <tr>
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
              <div v-if="!props.item.attributes.length">{{ props.item.minimumOrder }}</div>
              <div v-else class="text-xs-center"
                v-for="(variant, index) in props.item.attributes[0].items" :key="index"
              >
                {{ variant.name | capitalize }} - {{ variant.minimumOrder }}
              </div>
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

    <v-dialog max-width="750px" v-model="addProductDialog" persistent>
      <v-card>
        <v-card-title>
          <div class="title">{{ dialogText }}</div>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <v-card raised>
              <v-card-title class="font-weight-bold">
                Details
              </v-card-title>
              <v-divider></v-divider>
              <div class="px-3 pt-2">
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
                  label="Weight (g)*"
                  :rules="decimalOnlyRules"
                  v-model="product.weight"
                ></v-text-field>
                <v-text-field
                  label="Minimum Stock Order QTY*"
                  :rules="decimalOnlyRules"
                  v-model="product.minimumOrder"
                  v-if="!product.attributes.length && tempAttribItems.length <= 1"
                ></v-text-field>
              </div>
            </v-card>

            <v-card raised class="mt-4">
              <v-card-title class="font-weight-bold">
                Variants
              </v-card-title>
              <v-divider></v-divider>
              <v-layout row wrap v-if="!product.attributes.length" px-3 mt-2>
                <p class="font-italic text-xs-center red--text">
                  There are no variants yet in this product...
                </p>
                <v-flex xs12>
                  <v-divider class="my-2 primary" />
                </v-flex>
              </v-layout>

              <v-layout
                row
                wrap
                v-else
                v-for="(attrib, index) in product.attributes"
                :key="index"
                align-center
                justify-center
                px-3
                py-2
              >
                <v-flex xs2 class="text-xs-left">
                  <div class="font-weight-bold">{{ attrib.name }}</div>
                </v-flex>

                <v-flex xs5>
                  <div class="my-2 caption font-italic">Variant SKU | <b>Item Name</b> | Minimum Stock Order</div>
                  <div v-for="(item, index) in attrib.items" :key="index">
                    <span v-if="item.sku">
                      {{ item.sku }} | <b>{{ item.name }}</b> | {{ item.minimumOrder || "N/A" }} pcs.
                    </span>
                  </div>
                </v-flex>

                <v-flex xs3 pl-3>
                  <v-tooltip left>
                    <v-btn
                      slot="activator"
                      icon
                      class="primary white--text"
                      @click.stop="deleteAttribute(index)"
                    >
                      <v-icon>delete</v-icon>
                    </v-btn>
                    <span>Delete Variants</span>
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
                    <span>Edit Variants</span>
                  </v-tooltip>
                </v-flex>
                <v-flex xs12>
                  <v-divider class="my-2 primary" />
                </v-flex>
              </v-layout>

              <v-layout row wrap align-center justify-start mt-2 pa-3
                v-if="!product.attributes.length || (tempAttribName && tempAttribItems.length)"
              >
                <v-flex xs12 mb-1>
                  <div class="font-weight-bold">Product Variant Name</div>
                </v-flex>
                <v-flex xs12 mt-2>
                  <v-text-field
                    label="Variant Name"
                    placeholder="Ex: Color, Size, Weight, etc..."
                    v-model="tempAttribName"
                    solo
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 mt-2>
                  <v-layout wrap align-center justify-center>
                    <v-flex my-2 class="text-xs-left body-1 font-weight-bold">Variant Items</v-flex>
                    <v-flex xs12>
                      <v-data-table
                        :headers="attributesHeader"
                        :items="tempAttribItems"
                        item-key="sku"
                        hide-actions
                        class="elevation-3"
                      >

                        <template v-slot:items="props">
                          <tr>
                            <td class="text-xs-center">
                              <v-text-field v-model="props.item.sku"></v-text-field>
                            </td>

                            <td class="text-xs-center">
                              <v-text-field v-model="props.item.name"></v-text-field>
                            </td>

                            <td class="text-xs-center">
                              <v-text-field 
                                v-model="props.item.minimumOrder"
                                type="number"
                                @keydown.enter="addVariant(props.item)"
                              ></v-text-field>
                            </td>

                            <td class="text-xs-center" width="150px">
                              <!-- if the sku, name, and minimumOrder are filed, then make this delete button remove the entry -->
                              <v-btn icon small color="red" dark 
                                @click="deleteVariant(props.item)" 
                                v-if="
                                  (props.item.sku && props.item.name && props.item.minimumOrder) 
                                  && !props.item.hasOwnProperty('showAddButton')
                                "
                              >
                                <v-icon small>close</v-icon>
                              </v-btn>

                              <!-- if the sku, name, and minimumOrder are not yet added to the entry, then make this delete button clear both the text-fields -->
                              <v-btn icon small color="red" dark 
                                @click="props.item.sku = null; props.item.name = null; props.item.minimumOrder" 
                                v-else-if="
                                  (props.item.sku && props.item.name && props.item.minimumOrder) && 
                                  props.item.hasOwnProperty('showAddButton')
                                "
                              >
                                <v-icon small>close</v-icon>
                              </v-btn>

                              <!-- Only show the add button if the entry has'nt been push to the variants items -->
                              <v-btn icon small color="green darken-1" dark
                                @click="addVariant(props.item)" 
                                v-show="
                                  (props.item.sku && props.item.name && props.item.minimumOrder) && 
                                  props.item.hasOwnProperty('showAddButton')
                                "
                              >
                                <v-icon small>add</v-icon>
                              </v-btn>
                            </td>
                          </tr>
                        </template>

                      </v-data-table>
                    </v-flex>
                  </v-layout>
                  
                </v-flex>

                <v-flex xs12 mt-4>
                  <v-btn
                    v-if="!product.attributes.length"
                    block
                    small
                    color="primary"
                    depressed
                    :disabled="(tempAttribItems.length <= 1) || !tempAttribName"
                    @click="addProductAttribute"
                  >
                    Add Product Variants
                  </v-btn>

                  <v-btn
                    v-else-if="showEditConfirmButton"
                    block
                    small
                    color="secondary"
                    depressed
                    :disabled="!tempAttribName || ( tempAttribItems.length <= 1)"
                    @click="confirmEditProductAttribute"
                  >
                    Confirm Edit on Product Variants
                  </v-btn>
                </v-flex>

                <v-flex xs12 mt-1> 
                  <v-btn outline block small color="red" 
                    @click="resetVariantTable" :disabled="tempAttribItems.length <= 1">CANCEL</v-btn>
                </v-flex>
              </v-layout>
            </v-card>
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
        text: "Minimum Stock Order",
        value: "minimumOrder"
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
      price: null,
      resellerPrice: null,
      promotion: false,
      downloadURL: null,
      isOutofStock: null,
      id: null,
      minimumOrder: null,
      attributes: [
        {
          items: [
            {
              sku: null,
              name: null,
              minimumOrder: 0
            },
          ],
          name: null
        },
      ]
    },

    tempAttribName: null,
    tempAttribItems: [
      {
        sku: null,
        name: null,
        minimumOrder: 0,
      },
    ],
    attributesHeader: [
      { text: 'Variant SKU', value: 'sku', align: 'center', sortable: false },
      { text: 'Item Name', value: 'name', align: 'center', sortable: false },
      { text: 'Minimum Order QTY', value: 'minimumOrder', align: 'center', sortable: false },
      { text: 'Actions', value: false, align: 'center', sortable: false, fixed: true }
    ],

    showEditConfirmButton: false,
    productIndex: null,
    panel: false,

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
    variantEntryModel() {
      return {
        sku: null,
        name: null,
        minimumOrder: this.product.minimumOrder || null,
        showAddButton: true
      }
    },
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
    resetVariantTable() {
      this.tempAttribName = null;
      this.tempAttribItems = [];
      this.tempAttribItems.push(this.variantEntryModel());
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
      this.product.weight = null;
      this.product.minimumOrder = null;
      this.$refs.productFile.files.value = null;
      this.tempAttribName = null;
      this.tempAttribItems = [];
      this.product.attributes = [];

      this.resetVariantTable();
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
      this.product.weight = item.weight;
      this.product.minimumOrder = item.minimumOrder;
      this.product.attributes = item.attributes || [];
      this.$refs.productFile.files.value = null;
      
      this.resetVariantTable();
    },

    addProductAttribute() {
      //remove the last blank entry on the variants table
      this.tempAttribItems.pop();

      this.product.attributes.push({
        name: this.tempAttribName,
        items: this.tempAttribItems
      });

      this.resetVariantTable()

      console.log(this.product.attributes);
    },

    editAttribute(index) {
      this.tempAttribName = this.product.attributes[index].name;
      this.tempAttribItems = this.product.attributes[index].items;

      //push a blank object on variant table so that user could add a new variant if needed
      this.tempAttribItems.push({sku: null, name: null, showAddButton: true});

      this.showEditConfirmButton = true;
      this.productIndex = index;

      console.log(this.product.attributes);
    },

    confirmEditProductAttribute() {
      //remove the last blank entry on the variants table
      this.tempAttribItems.pop();

      this.product.attributes[this.productIndex].name = this.tempAttribName;
      this.product.attributes[this.productIndex].items = this.tempAttribItems;
      this.showEditConfirmButton = false;
      this.productIndex = null;

      this.resetVariantTable();

      console.log(this.product.attributes);
    },
    async deleteAttribute(index) {
      const r = await this.$swal.fire({
        title: "Warning!",
        text: `Are you sure you want to delete "${this.product.attributes[index].name}" variants?`,
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        showCloseButton: true
      });

      if (r.value) {
        this.product.attributes.splice(index, 1);

        this.resetVariantTable();
      }
    },


    addVariant(item) {
      if(!item.sku || !item.name || !item.minimumOrder) return;
      
      const index = this.tempAttribItems.findIndex(attrib => attrib.sku === item.sku);
      delete this.tempAttribItems[index].showAddButton;

      this.tempAttribItems.push(this.variantEntryModel());
      console.log('new tempAttribItems: ', this.tempAttribItems); 
    },

    editVariant(item) {
      const index = this.tempAttribItems.findIndex(variant => variant.sku === item.sku);
      if(index === -1) {
        return;
      }

      this.tempAttribItems[index].toggleEdit = this.tempAttribItems[index].toggleEdit ? false : true;
      console.log('real toggleEdit', this.tempAttribItems[index].toggleEdit);
    },

    deleteVariant(item) {
      if(this.tempAttribItems.length <= 1) return;
      const index = this.tempAttribItems.indexOf(item);
      if(index !== -1) {
        this.tempAttribItems.splice(index, 1);
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
            category: this.category.name,
            code: this.product.code,
            createdAt: Date.now(),
            description: this.product.description,
            name: this.product.name,
            price: Number(this.product.price),
            resellerPrice: Number(this.product.resellerPrice),
            weight: Number(this.product.weight),
            minimumOrder: this.product.minimumOrder ? Number(this.product.minimumOrder) : 1,
            attributes: this.product.attributes,
            searchTerms: this.product.name.split(" "),

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

          try {
            await this.$store.dispatch("inventory/CREATE_VARIANTS_FROM_PRODUCT", {
              productData: newProduct
            });
          
          } catch(error) {
            console.log(error);
          }

          this.addProductButtonDisabled = false;
          this.addProductDialog = false;
          this.$refs.productFile.value = null;

          this.resetVariantTable();

          this.$swal.fire({
            type: "success",
            title: "Success",
            text: "Product has been successfully added!"
          });
        }

        //Edit Product Details
      } else {
        this.addProductButtonDisabled = true;
        let searchTerms = this.product.name.split(" ").map(term => {
          return term.toLowerCase();
        });
        //try-catch block for saving productData to database
        const updatedProductData = {
          active: 1,
          categoryId: this.categoryId,
          category: this.category.name,
          code: this.product.code,
          description: this.product.description,
          name: this.product.name,
          price: Number(this.product.price),
          resellerPrice: Number(this.product.resellerPrice),
          weight: Number(this.product.weight),
          minimumOrder: this.product.minimumOrder ? Number(this.product.minimumOrder) : 1,
          downloadURL: this.product.downloadURL || null,
          pictureName: this.product.pictureName || null,
          id: this.product.id,
          attributes: this.product.attributes,
          searchTerms: searchTerms
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

        //edit the variants that is associated to the edited product
        try {
          await this.$store.dispatch("inventory/EDIT_VARIANTS_FROM_PRODUCT", {
            productData: updatedProductData
          });
        
        } catch(error) {
          console.log(error);
        }

        this.addProductButtonDisabled = false;
        this.addProductDialog = false;
        this.resetVariantTable();

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
        } else {
          product.photos = res;
          await this.$store.dispatch("products/UPDATE_PRODUCT", {
            productId: product.id,
            productData: product
          });
        }

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

          await this.$store.dispatch("products/UPDATE_PRODUCT", {
            productId: this.selectedProduct.id,
            productData: this.selectedProduct
          });

          this.$swal.fire({
            type: "success",
            title: "Success",
            text: "Image has been deleted!"
          });
        } catch (error) {
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
          name: null
        };
      }
    },
    selected(val) {
      this.$emit("selected", val);
    },
    "product.minimumOrder": {
      handler(value) {
        this.tempAttribItems[0].minimumOrder = value;
      },
      deep: true
    },
  },
  mixins: [mixins],
  computed: {

  },
  components: {
    vueDropzone: vue2Dropzone
  }
};
</script>
