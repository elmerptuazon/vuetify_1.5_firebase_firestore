<template>
  <div>
    <v-card>
      <v-card-title>
        <div class="headline">Products</div>
        <v-spacer></v-spacer>
        <v-text-field
          append-icon="search"
          label="Search product..."
          single-line
          hide-details
          v-model="search"
        ></v-text-field>
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
                  class="grey darken-2 white--text"
                  @click.stop="openUploadImagesDialog(props.item)"
                >
                  <v-icon>add_photo_alternate</v-icon>
                </v-btn>
                <span>Add image variants</span>
              </v-tooltip>
              <v-tooltip left>
                <v-btn
                  slot="activator"
                  icon
                  class="grey darken-2 white--text"
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
    <v-btn
      color="primary"
      dark
      fab
      bottom
      right
      fixed
      @click="addProductDialog = true"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <v-dialog max-width="500px" v-model="addProductDialog" persistent>
      <v-card>
        <v-card-title>
          <div class="title">Add product</div>
        </v-card-title>
        <v-card-text>
          <input type="file" ref="productFile" value="upload" />
          <v-text-field label="Name" v-model="newProduct.name"></v-text-field>
          <v-textarea
            label="Description"
            v-model="newProduct.description"
          ></v-textarea>
          <!-- <v-checkbox color="primary" label="This product is on sale" v-model="newProduct.sale.status"></v-checkbox> -->
          <v-text-field
            label="Percentage"
            v-model="newProduct.sale.percentage"
            v-show="newProduct.sale.status"
          ></v-text-field>
          <!-- <v-checkbox color="primary" label="This product is a promotion" v-model="newProduct.promotion"></v-checkbox> -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            flat
            @click.native="addProductDialog = false"
            :disabled="addProductButtonDisabled"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            class="white--text"
            :loading="addProductButtonDisabled"
            :disabled="addProductButtonDisabled"
            @click="addProduct"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog max-width="400" v-model="uploadImagesDialog" persistent>
      <v-card>
        <v-card-title>
          <div class="headline">Upload Photos</div>
          <v-spacer></v-spacer>
          <v-btn @click="uploadImagesDialog = false" flat icon>
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <p>*Images will be seen in the carousel</p>
          <input type="file" ref="file" multiple="multiple" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :loading="uploadLoading"
            :disabled="uploadLoading"
            @click="upload"
            >Upload</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import mixins from "@/mixins";
import { DB, STORAGE } from "@/config/firebase";
import { downScaleImageFromFile } from "@/helpers/helpers";
const productsCollection = DB.collection("products");
const storageRef = STORAGE.ref("appsell");
const uuidv4 = require("uuid/v4");

export default {
  props: ["items", "categoryId", "category"],
  created() {
    this.loading = true;
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
    uploadLoading: false
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
    async addProduct() {
      if (
        !this.newProduct.name ||
        !this.newProduct.description ||
        this.$refs.productFile.files.length < 1
      ) {
        console.log("some missing");
        return false;
      }

      const file = this.$refs.productFile.files[0];
      const name = this.newProduct.name;
      const metadata = { contentType: file.type };
      this.addProductButtonDisabled = true;

      try {
        const snapshot = await storageRef
          .child("products/" + name)
          .put(file, metadata);
        const downloadURL = await snapshot.ref.getDownloadURL();
        const newProductData = {
          active: 1,
          categoryId: this.categoryId,
          createdAt: Date.now(),
          downloadURL: downloadURL,
          promotion: this.newProduct.promotion,
          sale: this.newProduct.sale,
          name,
          description: this.newProduct.description,
          pictureName: name,
          uid: null
        };

        const response = await productsCollection.add(newProductData);

        newProductData.id = response.id;
        this.items.push(newProductData);
        this.addProductButtonDisabled = false;
        this.addProductDialog = false;

        this.category.totalProducts++;
        await this.$store.dispatch("categories/UPDATE_CATEGORY_BY_KEY", {
          categoryId: this.category.id,
          key: "totalProducts",
          value: this.category.totalProducts
        });

        this.notify("success", "Product has been successfully added");
      } catch (error) {
        console.log(error);
        this.addProductButtonDisabled = false;
        this.addProductDialog = false;
        this.notify("error", "An error occurred");
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
        this.notify("success", successMessage);
      } catch (error) {
        this.notify("error", "An error occurred");
      }
    },

    openUploadImagesDialog(product) {
      this.selectedProduct = product;
      this.uploadImagesDialog = true;
      console.log(product);
    },

    async upload() {
      const files = this.$refs.file.files;
      const uploads = [];

      const product = this.selectedProduct;

      // Array.from(files).forEach((file) => {
      // 	uploads.push(
      // 		downScaleImageFromFile(file, 200)
      // 		.then((data_url) => {
      // 			return storageRef.child(`variants/${product.id}/${uuidv4()}`).putString(data_url, 'data_url')
      // 			.then((snapshot) => {
      // 				return snapshot.ref.getDownloadURL()
      // 				.then(downloadURL => downloadURL)
      // 			})
      // 		})
      // 	);
      // });

      Array.from(files).forEach(file => {
        uploads.push(
          storageRef
            .child(`variants/${product.id}/${uuidv4()}`)
            .put(file)
            .then(snapshot => {
              return snapshot.ref
                .getDownloadURL()
                .then(downloadURL => downloadURL);
            })
        );
      });

      this.uploadLoading = true;

      try {
        const res = await Promise.all(uploads);

        if (product.hasOwnProperty("photos")) {
          const photos = [...product.photos, ...res];
          await productsCollection.doc(product.id).update({ photos: photos });
          console.log("photos", photos);
          this.$emit("itemUpdated", {
            id: product.id,
            photos
          });
          this.selectedProduct.photos = photos;
        } else {
          console.log("res", res);
          await productsCollection.doc(product.id).update({ photos: res });
          this.selectedProduct.photos = res;
          this.$emit("itemUpdated", {
            id: product.id,
            photos: res
          });
        }
        this.notify("success", "Variant images has been successfully uploaded");
        this.uploadImagesDialog = false;
      } catch (error) {
        console.log(error);
      }

      this.uploadLoading = false;
    },

    view(item) {
      this.$router.push({
        name: "ViewCategory",
        params: {
          id: this.categoryId,
          data: item
        }
      });
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
  mixins: [mixins]
};
</script>
