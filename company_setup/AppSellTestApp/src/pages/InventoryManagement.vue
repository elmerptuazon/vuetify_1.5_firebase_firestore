<template>
  <v-container align-center justify-center fluid>
    <v-layout align-center justify-center wrap row>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <v-layout align-center justify-start row wrap>
              <v-flex lg4 xs12>
                <div class="headline">
                  Inventory Mangement
                  <span>
                    <v-tooltip bottom color="primary" dark>
                      <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on">
                          <v-icon color="grey lighten-1">help</v-icon>
                        </v-btn>
                      </template>
                      <span>
                        <b>NOTE:</b> This is the list of all the variants of your products.<br/> 
                        Columns with an underline are editable, just click it to edit the details in that column.
                      </span>
                    </v-tooltip>
                  </span>
                </div>
              </v-flex>
              <v-flex lg6 offset-lg1 xs12>
                <v-text-field
                  v-model="search"
                  placeholder="search products..."
                  prepend-icon="search"
                  clearable
                ></v-text-field>
              </v-flex>
              <v-flex xs12 mt-1>
                <v-divider></v-divider>
              </v-flex>
            </v-layout>
          </v-card-title>
          
          <v-container fluid>
            <v-data-table
              :headers="headers"
              :items="products"
              item-key="id"
              class="elevation-1"
              :search="search"
              :loading="loading"
              :rows-per-page-items="rowsPerPageItems"
              :pagination.sync="pagination"
            >
              <template v-slot:headerCell="props">
                <v-tooltip bottom nudge-bottom max-width="200">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      <div v-if="props.header.value === '' || props.header.value === 'isOutofStock'" class="pt-3 pb-2">
                        <div v-for="(word, index) in props.header.text.split('\n')" :key="index">
                          {{ word }}
                        </div>
                      </div>
                      
                      <div v-else class="pb-2">
                        <div v-for="(word, index) in props.header.text.split('\n')" :key="index">
                          {{ word }}
                        </div>
                      </div>
                      
                    </span>
                  </template>
                  <span>
                    <div class="font-weight-bold body-2">{{ props.header.text }}</div>
                    <div class="mt-2 body-1">{{ props.header.description }}</div>
                  </span>
                </v-tooltip>
              </template>

              <template v-slot:items="props">
                <tr 
                  :class="[ 
                    props.item.position === 1 ? 'red lighten-3' : '',
                  ]"
                >
                  <td class="text-xs-center">
                    <v-btn icon color="green" small dark @click="openEditQuantityDialog(props.item)">
                      <v-icon small>edit</v-icon>
                    </v-btn>
                  </td>

                  <td class="text-xs-center">{{props.item.productName}}</td>

                  <td class="text-xs-center" v-if="!props.item.variantName"> - </td>
                  <td class="text-xs-center" v-else>{{props.item.name}}</td>
                  
                  <td class="text-xs-center">{{props.item.onHandQTY}}</td>

                  <td class="text-xs-center">{{props.item.allocatedQTY}}</td>

                  <td class="text-xs-center">{{props.item.availableQTY}}</td>

                  <td class="text-xs-center">{{props.item.reOrderLevel}}</td>

                  <td class="py-2">
                    <v-layout align-end justify-space-around pt-4>
                      <v-flex xs3>
                        <v-checkbox
                          v-model="props.item.isOutofStock"
                          @change="markAsOutOfStock(props.item)"
                        ></v-checkbox>
                      </v-flex>
                    </v-layout>
                  </td>
                </tr>
              </template>
            </v-data-table>  
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>

    <v-dialog v-model="showEditQuantityDialog" persistent width="550px">
      <v-card>
        <v-card-title class="primary dark white--text title font-weight-bold">
          EDIT QUANTITY IN PRODUCT VARIANT
          <v-spacer></v-spacer>
          <v-icon medium color="white" @click="closeEditQuantityDialog">close</v-icon>
        </v-card-title>
        <v-container align-center justify-center>
          <v-layout row align-center justify-start wrap>
            <v-flex xs12>
              <span class="subheading">Product Name: </span>
              <span class="subheading font-weight-bold">{{ selectedVariant.productName }}</span>
            </v-flex>
            <v-flex xs12 mt-2>
              <span class="subheading">Variant Name: </span>
              <span v-if="selectedVariant.variantName" class="subheading font-weight-bold">{{ selectedVariant.name }}</span>
              <span v-else class="subheading font-weight-bold"> - </span>
            </v-flex>
            <v-flex xs12 mt-3>
              <v-divider></v-divider>
            </v-flex>
          </v-layout>
          <v-layout align-center justify-start wrap row mt-4>
            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.onHandQTY"
                outline
                label="QTY on Hand*"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="200">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{ fieldDescription('onHandQTY').text.toUpperCase() }}: </div>
                  <div class="mt-2 body-1">{{ fieldDescription('onHandQTY').description }}</div>
                </span>
              </v-tooltip>
            </v-flex>

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.reOrderLevel"
                outline
                label="Re-Order Level*"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="200">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{ fieldDescription('reOrderLevel').text.toUpperCase() }}: </div>
                  <div class="mt-2 body-1">{{ fieldDescription('reOrderLevel').description }}</div>
                </span>
              </v-tooltip>
            </v-flex>

            <!-- <v-flex xs10>
              <v-checkbox
                :label="`OUT OF STOCK?:  ${selectedVariant.isOutofStock}`"
                v-model="selectedVariant.isOutofStock"
              ></v-checkbox>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="200">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{ fieldDescription('isOutofStock').text.toUpperCase() }}: </div>
                  <div class="mt-2 body-1">{{ fieldDescription('isOutofStock').description }}</div>
                </span>
              </v-tooltip>
            </v-flex> -->

          </v-layout>
        </v-container>

        <v-divider class="my-2"></v-divider>

        <v-card-actions>
          <v-layout align-center justify-end wrap>
            <v-flex xs2>
              <v-btn outline @click="closeEditQuantityDialog">CANCEL</v-btn>
            </v-flex>
            <v-flex xs2 ml-3>
              <v-btn color="green" dark 
                :loading="btnLoading"
                @click="editVariant(selectedVariant)"
              >SAVE</v-btn>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack" :timeout="4000" :color="snackColor">
      {{ snackText }}
      <v-btn flat @click="snack = false">Close</v-btn>
    </v-snackbar>

  </v-container>
</template>

<script>
import moment from 'moment';
import mixins from "@/mixins";
import { DB } from "@/config/firebase";

export default {
  mixins: [mixins],
  async mounted() {
    this.loading = true;
    this.loading = false;
    
  },
  data: () => ({
    loading: false,
    textfieldLoading: false,
    search: null,
    headers: [
      {
        text: 'Edit\nQTYs', align: 'center', value: '', sortable: false,
        description: 'Click the green icon to edit the associated quantities of a product variant.'
      },
      {
        text: 'Product\nName', align: 'center', value: 'productName', sortable: true,
        description: 'The name of the product.'
      },
      {
        text: 'Variant\nName', align: 'center', value: 'name', sortable: true, 
        description: 'Variant name of the product'
      },
      {
        text: 'QTY\non Hand', align: 'center', value: 'onHandQTY', sortable: true, 
        description: 
          'When you receive or produce inventory, add that number to this total. ' + 
          'When these items leave your stock they are automatically subtracted '
      },
      {
        text: 'QTY\nAllocated', align: 'center', value: 'allocatedQTY', sortable: true, 
        description: 
        'This is the total number of your "QTY on Hand" inventory that have already been committed ' + 
        'to orders you have received from your Resellers.'
      },
      {
        text: 'QTY\nAvailable', align: 'center', value: 'availableQTY', sortable: true, 
        description: 
          'This is the inventory you have available and ready for new orders from your Resellers. ' + 
          'This value is generated by subtracting "QTY Allocated" from "QTY on Hand."'
      },
      {
        text: 'Re-Order\nLevel', align: 'center', value: 'reOrderLevel', sortable: true,
        description: 
          'Use this field to set the number of "QTY Available" inventory at which you would like to be notified to order / ' +
          'produce more inventory for this product. When the "QTY Available" number counts down to the number you set, ' +
          'this product will rise to the top of the page and a red notification badge will appear on your menu list ' +
          'next to the "Inventory Management" title.'
      },
      {
        text: 'Out of\nStock?', align: 'center', value: 'isOutofStock', sortable: false,
        description: 'Tick this box, to mark a product as "Out of Stock". \n' + 
          'But this box is automatically ticked, once "QTY on Hand" is zero.'
      },
    ],

    pagination: {
      sortBy: 'position',
      rowsPerPage: 20,
    },
    rowsPerPageItems: [10, 20, 50, {text: 'All', value: -1}],

    snack: false,
    snackText: '',
    snackColor: 'primary',

    selectedVariant: {},
    showEditQuantityDialog: false,
    btnLoading: false,

  }),

  computed: {
    items() {
      return this.$store.getters['inventory/GET_ALL_PRODUCTS'];
    },
    products() {
      this.loading = true;
      const products = this.items;

      let modifiedProducts = products.map((product) => {
        product.availableQTY = parseInt(product.onHandQTY) - parseInt(product.allocatedQTY);
        
        if(product.availableQTY === 0) {
          product.isOutofStock = true;
        }

        if(product.isOutofStock || product.availableQTY <= product.reOrderLevel) {
          product.position = 1;
        
        } else {
          product.position = 2;
        }
        
        return product;
      });

      this.loading = false;
      return modifiedProducts;
    }
  },

  watch: {
    
  },

  methods: {
    showSnackBar(state, message) {
      this.snack = true;
      this.snackText = message;
      this.snackColor = state === 'success' ? 'success' : 'red';
    },

    fieldDescription(field) {
      const fieldObj = this.headers.find(header => header.value.toLowerCase() === field.toLowerCase());
      
      if(fieldObj.text.includes("?")) {
        fieldObj.text = fieldObj.text.replace('?', '');
      }

      return fieldObj;
    },

    async updateVariantField(variantProperty, product) {
      this.textfieldLoading = true;
      console.log('variant property: ', variantProperty);
      console.log('updating product: ', product);

      let variantValue = product[variantProperty];

      const isANumber = variantProperty.includes('QTY') || 
                        variantProperty === 'price' || 
                        variantProperty === 'weight' || 
                        variantProperty === 'reOrderLevel';

      if(isANumber) {
        variantValue = Number(variantValue);
      }

      try {
        await this.$store.dispatch('inventory/UPDATE_PRODUCT_DETAIL', {
          id: product.id,
          key: variantProperty,
          value: variantValue,
        });

        this.showSnackBar('success', `${product.sku} was successfully updated!`);
        this.textfieldLoading = false;

      } catch(error) {
        console.log('inventory management error: ', error.response);
        this.showSnackBar('error', `${product.sku} was not updated due to error!`);
        this.textfieldLoading = false;
      }
    },

    openEditQuantityDialog(item) {
      this.selectedVariant = Object.assign({}, item);
      this.showEditQuantityDialog = true;
    },

    closeEditQuantityDialog() {
      this.showEditQuantityDialog = false;
      this.selectedVariant = {};
    },

    async markAsOutOfStock(product) {
      this.loading = true;
      console.log('updating product: ', product);
      console.log(product);

      if(!product.isOutofStock) {
        this.loading = false;
        this.openEditQuantityDialog(product);
        return;
      }

      try {
        await this.$store.dispatch('inventory/UPDATE_MULTIPLE_PRODUCT_FIELDS', {
          id: product.id,
          updatedDetails: {
            isOutofStock: product.isOutofStock,
            onHandQTY: 0
          }
        });

        this.showSnackBar('success', `${product.productName.toUpperCase()} was successfully updated!`);
        this.textfieldLoading = false;

      } catch(error) {
        console.log('inventory management error: ', error.response);
        this.showSnackBar('error', `${product.productName.toUpperCase()} was not updated due to error!`);
        this.textfieldLoading = false;
      }

      this.loading = false;
    },

    
    async editVariant() {
      this.btnLoading = true;

      const { sku, onHandQTY, reOrderLevel, weight, price, isOutofStock } = this.selectedVariant;
      const updatedVariant = {
        sku, 
        onHandQTY: Number(onHandQTY), 
        reOrderLevel: Number(reOrderLevel), 
        isOutofStock
      };

      try {
        await this.$store.dispatch('inventory/UPDATE_MULTIPLE_PRODUCT_FIELDS', {
          id: this.selectedVariant.id,
          updatedDetails: updatedVariant
        });

        this.btnLoading = false;
        this.showEditQuantityDialog = false;
        this.showSnackBar('success', `Updating ${this.selectedVariant.productName.toUpperCase()} was successful!`);
        this.selectedVariant = {};
        
      } catch(error) {
        console.log('error in editVariant method: ', error);
        this.btnLoading = false;
        this.showEditQuantityDialog = false;
        this.showSnackBar('error', `Updating ${this.selectedVariant.productName.toUpperCase()} was not successful! Please try again.`);
        this.selectedVariant = {};
        
        throw error;
      }
    },

    async deleteVariant(item) {
      const response = await this.$swal.fire({
        title: "Warning!",
        text: `Are you sure you want to delete "${item.productName} - ${item.name}" variant?`,
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        showCloseButton: true
      });

      if(!response.value) {
        return;
      }

      try {
        this.btnLoading = true;

        await this.$store.dispatch('inventory/DELETE_PRODUCT', item.id);
        
        this.showSnackBar('success', `${item.sku} was successfully deleted!`);
        this.textfieldLoading = false;
        this.btnLoading = false;
        this.showEditDialog = false;

      } catch(error) {
        console.log('inventory management error: ', error.response);
        this.showSnackBar('error', `${item.sku} was not deleted!`);
        this.textfieldLoading = false;
        this.btnLoading = false;
        this.showEditDialog = false;
      }
    }
  },

}
</script>

<style>

</style>