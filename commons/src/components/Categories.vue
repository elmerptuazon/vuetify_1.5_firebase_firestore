<template>
  <div>
    <v-card>
      <v-card-title>
        <div class="headline">Categories</div>

        <v-spacer></v-spacer>

        <v-text-field
          append-icon="search"
          label="Search category..."
          hide-details
          v-model="search"
        ></v-text-field>

        <v-btn
          dark
          class="primary white--text"
          @click="addCategoryDialog = true"
        >
          <v-icon class="mr-2">add</v-icon>
          <span>Add Category</span>
        </v-btn>

        <v-btn dark class="primary white--text" @click="excelDialog = true">
          <v-icon class="mr-2">add</v-icon>
          <span>UPLOAD EXCEL FILE</span>
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
            <td class="text-xs-center">{{ props.item.name }}</td>
            <td class="text-xs-center">{{ props.item.totalProducts }}</td>
            <td class="text-xs-center">
              {{ props.item.created | momentize("MMMM D, YYYY") }}
            </td>
            <td class="text-xs-center">
              <a @click.prevent="updatePosition(props.item)">{{
                props.item.position
              }}</a>
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
      {{ modal.text }}
    </sweet-modal>

    <v-dialog max-width="500px" v-model="addCategoryDialog" persistent>
      <v-card>
        <v-card-title>
          <div class="title">Add category</div>
        </v-card-title>
        <v-card-text>
          <p class="caption grey--text darken-2 font-italic mb-2">
            Category Thumbnail
          </p>
          <input
            type="file"
            ref="categoryFile"
            value="upload"
            accept=".png, .jpg, .jpeg"
            @change="validateFile"
          />
          <v-divider class="mt-2" />
          <v-text-field
            label="Category Name"
            v-model="newCategory.name"
          ></v-text-field>
          <!-- <v-checkbox color="primary" label="This category is a promotion" v-model="newCategory.promotion"></v-checkbox> -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            flat
            @click.native="addCategoryDialog = false"
            :disabled="addCategoryButtonDisabled"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            class="white--text"
            :loading="addCategoryButtonDisabled"
            :disabled="addCategoryButtonDisabled || !this.newCategory.name"
            @click="addCategory"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog max-width="300px" v-model="updatePositionDialog">
      <v-card>
        <v-card-title>
          <div class="title">Update Position</div>
        </v-card-title>
        <v-card-text>
          <v-select
            :items="positions"
            v-model="selectedPosition"
            label="Position"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="updatePositionDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="savePosition">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog max-width="500px" v-model="editCategoryDialog" persistent>
      <v-card>
        <v-card-title>
          <div class="title">Edit Category Details</div>
        </v-card-title>
        <v-card-text>
          <input
            type="file"
            ref="editCategoryFile"
            value="upload"
            accept=".png, .jpg, .jpeg"
            @change="validateFile"
          />
          <v-avatar v-if="category.downloadURL" size="100px" tile>
            <v-img
              contain
              :src="category.downloadURL"
              :alt="category.name"
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
            label="Category Name"
            v-model="category.name"
          ></v-text-field>
          <!-- <v-checkbox color="primary" label="This category is a promotion" v-model="category.promotion"></v-checkbox> -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            flat
            @click.native="editCategoryDialog = false"
            :disabled="categoryButtonDisabled"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            class="white--text"
            :loading="categoryButtonDisabled"
            :disabled="categoryButtonDisabled"
            @click="editCategory"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog max-width="500px" v-model="excelDialog" persistent>
      <v-card>
        <v-card-title>
          <div class="title">
            Adding Categories and Products through Excel File
          </div>
        </v-card-title>
        <v-card-text>
          <div class="mb-1">
            <input
              type="file"
              ref="excelFile"
              value="upload"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              @change="validateExcelFile"
            />
          </div>
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
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn flat @click.native="excelDialog = false">CANCEL</v-btn>
          <v-btn
            color="primary"
            @click.native="uploadExcelFile"
            :disabled="excelButtonLoading"
            :loading="excelButtonLoading"
            >UPLOAD FILE
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import XLSX from "xlsx";
import { mapState } from "vuex";
import mixins from "@/mixins";
import { DB, STORAGE } from "@/config/firebase";
import { downScaleImageFromFile } from "@/helpers/helpers";
const categoriesCollection = DB.collection("catalogues");
const productsCollection = DB.collection("products");
const storageRef = STORAGE.ref("appsell");

export default {
  props: ["items"],
  async mounted() {
    // this.loading = true;
    //await this.$store.dispatch("categories/FETCH_CATEGORIES");
    // this.loading = false;
    this.excelDownloadURL = await this.$store.dispatch(
      "categories/GET_EXCEL_TEMPLATE"
    );
  },
  data: () => ({
    pagination: {
      sortBy: "position"
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
        text: "Total Products",
        value: "totalProducts"
      },
      {
        text: "Date added",
        value: "created"
      },
      {
        text: "Display Position",
        value: "position"
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
    addCategoryDialog: false,
    addCategoryButtonDisabled: false,
    newCategory: {
      name: null,
      promotion: false
    },
    category: {
      name: null,
      downloadURL: null,
      totalProducts: null
    },
    statusButtonLoading: false,
    positions: [],
    selectedPosition: null,
    updatePositionDialog: false,
    selectedCategory: {},
    disableDeleteButton: true,
    editCategoryDialog: false,
    categoryButtonDisabled: false,
    excelDialog: false,
    excelButtonLoading: false,
    excelDownloadURL: ""
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
        this.$swal.fire({
          type: "error",
          title: "Error",
          text: "The uploaded file is not an image file. Please try again."
        });
      }
    },
    async addCategory() {
      if (!this.newCategory.name || this.$refs.categoryFile.files.length < 1) {
        this.$swal.fire({
          type: "error",
          title: "Saving Failed",
          text: "The category image and name are both required."
        });
        return;
      }

      const index = this.items.findIndex(
        i => i.name.toLowerCase() === this.newCategory.name.toLowerCase()
      );

      if (index !== -1) {
        this.$swal.fire({
          type: "error",
          title: "Error",
          text: "Category Name already exists. Please try another name."
        });
        return;
      }

      const file = this.$refs.categoryFile.files[0];

      const metadata = { contentType: file.type };
      this.addCategoryButtonDisabled = true;

      try {
        const newCategoryData = {
          active: 1,
          created: Date.now(),
          promotion: this.newCategory.promotion,
          name: this.newCategory.name,
          pictureName: null,
          downloadURL: null,
          totalProducts: 0,
          position: this.items.length + 1
        };

        const response = await this.$store.dispatch("categories/ADD_CATEGORY", {
          categoryData: newCategoryData
        });

        const snapshot = await storageRef
          .child("catalogues/" + response.id)
          .put(file, metadata);
        const downloadURL = await snapshot.ref.getDownloadURL();
        newCategoryData.pictureName = response.id;
        newCategoryData.downloadURL = downloadURL;

        await this.$store.dispatch("categories/UPDATE_CATEGORY", {
          categoryId: response.id,
          categoryData: newCategoryData
        });

        this.addCategoryButtonDisabled = false;
        this.addCategoryDialog = false;

        this.$swal.fire({
          type: "success",
          title: "Success!",
          text: "Category has been successfully added."
        });
        this.$refs.categoryFile.files.value = null;
      } catch (error) {
        console.log(error);
        this.addCategoryButtonDisabled = false;
        this.addCategoryDialog = false;

        this.$swal.fire({
          type: "error",
          title: "Error",
          text: "An error occurred. Please try again."
        });
        this.$refs.categoryFile.files.valur = null;
      }
    },
    openEditDialog(item) {
      this.editCategoryDialog = true;
      this.category = {
        name: item.name,
        downloadURL: item.downloadURL,
        pictureName: item.pictureName,
        totalProducts: item.totalProducts,
        id: item.id
      };
    },
    async editCategory() {
      if (!this.category.name) {
        this.$swal.fire({
          type: "error",
          title: "Error",
          text: "Category name is required!"
        });
        return false;
      }

      try {
        this.categoryButtonDisabled = true;

        if (this.$refs.editCategoryFile.files.length > 0) {
          try {
            await storageRef.child("catalogues/" + this.category.id).delete();
          } catch (e) {
            console.log("deletingError: ", e.message);
          }
          const file = this.$refs.editCategoryFile.files[0];
          const rescaledImage = await downScaleImageFromFile(file);
          const snapshot = await storageRef
            .child("catalogues/" + this.category.id)
            .putString(rescaledImage, "data_url");

          const downloadURL = await snapshot.ref.getDownloadURL();

          this.category.pictureName = this.category.id;
          this.category.downloadURL = downloadURL;
        }

        await this.$store.dispatch("categories/UPDATE_CATEGORY", {
          categoryId: this.category.id,
          categoryData: this.category
        });

        this.categoryButtonDisabled = false;
        this.editCategoryDialog = false;

        this.$swal.fire({
          type: "success",
          title: "Success",
          text: "Category has been successfully updated!"
        });
      } catch (error) {
        this.$swal.fire({
          type: "error",
          title: "Error",
          text: "An error occured. Please try again."
        });
        console.log(error);
      }
    },
    changeStatus(item) {
      let question;
      if (item.active === 1)
        question = "Are you sure you want to archive this category?";
      else question = "Are you sure you want to unarchive this category?";
      this.$swal
        .fire({
          title: "Category Update",
          text: question,
          type: "warning",
          showCancelButton: true,
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, update it!"
        })
        .then(result => {
          if (result.value) {
            this.statusButtonLoading = true;
            const active = item.active === 1 ? 0 : 1;
            const promise = categoriesCollection
              .doc(item.id)
              .update({ active });
            const text =
              item.active === 1
                ? "Category has been successfully archived"
                : "Category has been successfully unarchived";
            promise.then(() => {
              const itemIndex = this.items.findIndex(i => i.id === item.id);
              this.items[itemIndex].active = active;
              this.statusButtonLoading = false;

              this.$swal.fire({
                type: "success",
                title: "Success",
                text: text
              });
            });
          }
        });
    },
    view(item) {
      this.$router.push({
        name: "ViewCategory",
        params: {
          id: item.id,
          data: item
        }
      });
    },
    updatePosition(item) {
      this.positions = [];

      this.selectedCategory = item;
      this.items.forEach((product, index) => {
        this.positions.push(index + 1);
      });

      this.updatePositionDialog = true;
    },
    async savePosition() {
      try {
        const index = this.items.findIndex(
          i => i.position === this.selectedPosition
        );

        const selectedCategoryClone = JSON.parse(
          JSON.stringify(this.selectedCategory)
        );

        if (index === -1) {
          await categoriesCollection
            .doc(selectedCategoryClone.id)
            .update({ position: this.selectedPosition });
          const categoryIndex = this.items.findIndex(
            i => i.id === selectedCategoryClone.id
          );
          this.items[categoryIndex].position = this.selectedPosition;
        } else {
          await categoriesCollection
            .doc(selectedCategoryClone.id)
            .update({ position: this.selectedPosition });
          await categoriesCollection
            .doc(this.items[index].id)
            .update({ position: selectedCategoryClone.position });
          const categoryIndex = this.items.findIndex(
            i => i.id === selectedCategoryClone.id
          );
          this.items[categoryIndex].position = this.items[index].position;
          this.items[index].position = selectedCategoryClone.position;
        }

        this.$swal.fire({
          type: "success",
          title: "success",
          text: "Display position updated!"
        });
        this.updatePositionDialog = false;
      } catch (error) {
        console.log(error);
      }
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
      } else {
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
        for (let i = 0; i != workbook.SheetNames.length; i++) {
          let worksheet = workbook.Sheets[workbook.SheetNames[i]];
          let categoryName = workbook.SheetNames[i];

          //check if current category on excel is existing in the db
          const index = this.items.findIndex(
            item => item.name === categoryName
          );
          let categoryData = {};

          if (index == -1) {
            categoryData = {
              name: categoryName,
              created: Date.now(),
              active: 1,
              totalProducts: 0,
              position: this.items.length + 1,
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
            categoryData = this.items[index];
            console.log("EXISTING CATEGORY: ", categoryData);
          }

          let productList = XLSX.utils.sheet_to_json(worksheet, { raw: true });

          productList = await productList.map(p => {
            // let attributes = [];

            // if(p.Size) {
            //   const sizeArr = p.Size.split("," || ", ");
            //   p.Size = {
            //     items: sizeArr,
            //     name: "Size"
            //   }
            // }
            // else {
            //   p.Size = null;
            // }
            // attributes.push(p.Size);

            // if(p.Color) {
            //   const colorArr = p.Color.split("," || ", ");
            //   p.Color = {
            //     items: colorArr,
            //     name: "Color"
            //   }
            // }
            // else {
            //   p.Color = null;
            // }
            // attributes.push(p.Color);

            return {
              active: 1,
              code: p.Code,
              name: p.Name,
              price: Number(p.Price),
              resellerPrice: Number(p.ResellerPrice),
              description: p.Description,
              weight: Number(p.Weight),
              // sale: p.Sale
              //   ? {
              //       status: true,
              //       percentage: p.Sale
              //     }
              //   : {
              //       status: false,
              //       percentage: null
              //     },
              // discount: p.Discount ? p.Discount : null,
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
          for (let i = 0; i < productList.length; i++) {
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
        this.excelDialog = false;

        this.$swal.fire({
          type: "info",
          title: "Success",
          text: "The Category and its Products has been uploaded successfully."
        });

        this.$refs.excelFile.value = null;
      }
    }
  },
  watch: {
    addCategoryDialog(val) {
      if (!val) {
        this.newCategory.name = null;
      }
    },
    selected(arr) {
      this.disableDeleteButton = arr.length > 0 ? false : true;
    }
  },
  computed: {
    // ...mapState("categories", {
    //   items: state => state.categoryList
    // })
  },
  mixins: [mixins]
};
</script>
