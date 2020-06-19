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
                <th>
                  <v-tooltip bottom nudge-bottom max-width="200">
                    <template v-slot:activator="{ on }">
                      <span v-on="on" class="text-xs-center">
                        <div v-for="(word, index) in props.header.text.split(' ')" :key="index">
                          {{ word }}
                        </div>
                      </span>
                    </template>
                    <span class="align-center justify-center">
                      <div class="font-weight-bold body-2">{{ props.header.text }}</div>
                      <div class="mt-2 body-1">{{ props.header.description }}</div>
                    </span>
                  </v-tooltip>
                </th>
              </template>

              <template v-slot:items="props">
                <tr 
                  :class="[ 
                    props.item.position === 1 ? 'red lighten-3' : '',
                  ]"
                >
                  <td class="text-xs-center pa-0 ma-0">
                    <v-btn icon color="green" small dark @click="openEditDialog(props.item)">
                      <v-icon small>edit</v-icon>
                    </v-btn>
                  </td>

                  <td class="text-xs-center pa-0 ma-0">{{props.item.productName}}</td>

                  <td class="text-xs-center pa-0 ma-0">{{props.item.name}}</td>
                  
                  <td class="text-xs-center pa-0 ma-0">{{props.item.onHandQTY}}</td>

                  <td class="text-xs-center pa-0 ma-0">{{props.item.allocatedQTY}}</td>

                  <td class="text-xs-center pa-0 ma-0">{{props.item.availableQTY}}</td>

                  <td class="text-xs-center pa-0 ma-0">{{props.item.reOrderLevel}}</td>

                  <td class="pt-4">
                    <v-checkbox
                      class="ml-4"
                      @change="markAsOutOfStock(props.item)"
                      v-model="props.item.isOutofStock"
                    ></v-checkbox>
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
          ADD QUANTITY IN PRODUCT
          <v-spacer></v-spacer>
          <v-icon medium color="white" @click="showEditQuantityDialog = false">close</v-icon>
        </v-card-title>
        <v-container align-center justify-center>
          <v-layout align-start justify-start wrap>
            <v-flex xs12>
              <div class="font-italic body-1 font-weight-bold">Note: Fill up only quantity and re-order section</div>
            </v-flex>
          </v-layout>
          
          <v-layout align-center justify-start wrap row mt-3>
            <v-flex xs12>
              <v-text-field
                :value="selectedVariant.productName"
                readonly
                label="Product Name"
                disabled
              ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                :value="selectedVariant.name"
                readonly
                label="Variant Name"
                disabled
              ></v-text-field>
            </v-flex>

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.sku"
                outline
                label="Variant SKU*"
                disabled
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{new String("Variant SKU").toUpperCase()}}: </div>
                  <div class="mt-2 body-1">Variant SKU of the product.</div>
                </span>
              </v-tooltip>
            </v-flex>

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.onHandQTY"
                outline
                label="QTY on Hand*"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
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
                v-model="selectedVariant.availableQTY"
                readonly
                label="QTY on Available"
                type="number"
                disabled
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{ fieldDescription('availableQTY').text.toUpperCase() }}: </div>
                  <div class="mt-2 body-1">{{ fieldDescription('availableQTY').description }}</div>
                </span>
              </v-tooltip>
            </v-flex>

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.allocatedQTY"
                readonly
                label="QTY Allocated"
                type="number"
                disabled
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{ fieldDescription('allocatedQTY').text.toUpperCase() }}: </div>
                  <div class="mt-2 body-1">{{ fieldDescription('allocatedQTY').description }}</div>
                </span>
              </v-tooltip>
            </v-flex>

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.reOrderLevel"
                outline
                label="Re-Order Notification Level*"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
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

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.weight"
                outline suffix="grams"
                label="Variant Weight*"
                type="number"
                disabled
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{ new String("Variant Weight").toUpperCase() }}: </div>
                  <div class="mt-2 body-1">Weight of the variant, this weight will be used for shipping calculations.</div>
                </span>
              </v-tooltip>
            </v-flex>

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.price"
                outline prefix="PHP "
                label="Variant Price*"
                type="number"
                disabled
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{ new String("Variant Price").toUpperCase() }}: </div>
                  <div class="mt-2 body-1">Price of this particular variant of a product.</div>
                </span>
              </v-tooltip>
            </v-flex>

            <v-flex xs10>
              <v-checkbox
                :label="`Is this variant OUT OF STOCK: ${selectedVariant.isOutofStock}`"
                v-model="selectedVariant.isOutofStock"
                disabled
              ></v-checkbox>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
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
            </v-flex>

          </v-layout>
        </v-container>

        <v-divider class="my-2"></v-divider>

        <v-card-actions>
          <v-layout align-start justify-end wrap>
            <v-flex xs2 offset-xs1>
              <v-btn color="green" dark 
                :loading="btnLoading" :disabled="btnLoading"
                @click="editVariant(selectedVariant)"
              >SAVE</v-btn>
            </v-flex>
            <v-flex xs2 offset-xs1>
              <v-btn outline @click="showEditQuantityDialog = false">CANCEL</v-btn>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <v-dialog v-model="showEditDialog" persistent width="550px">
      <v-card>
        <v-card-title class="primary dark white--text title font-weight-bold">
          EDIT PRODUCT VARIANT DETAILS
          <v-spacer></v-spacer>
          <v-icon medium color="white" @click="showEditDialog = false">close</v-icon>
        </v-card-title>
        <v-container align-center justify-center>
          <v-layout align-start justify-start wrap>
            <v-flex xs12>
              <div class="font-italic body-1 font-weight-bold">Note: Fields with "*" are editable</div>
            </v-flex>
          </v-layout>
          
          <v-layout align-center justify-start wrap row mt-3>
            <v-flex xs12>
              <v-text-field
                :value="selectedVariant.productName"
                readonly
                label="Product Name"
              ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                :value="selectedVariant.name"
                readonly
                label="Variant Name"
              ></v-text-field>
            </v-flex>

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.sku"
                outline
                label="Variant SKU*"
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{new String("Variant SKU").toUpperCase()}}: </div>
                  <div class="mt-2 body-1">Variant SKU of the product.</div>
                </span>
              </v-tooltip>
            </v-flex>

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.onHandQTY"
                outline
                label="QTY on Hand*"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
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
                v-model="selectedVariant.availableQTY"
                readonly
                label="QTY on Available"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{ fieldDescription('availableQTY').text.toUpperCase() }}: </div>
                  <div class="mt-2 body-1">{{ fieldDescription('availableQTY').description }}</div>
                </span>
              </v-tooltip>
            </v-flex>

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.allocatedQTY"
                readonly
                label="QTY Allocated"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{ fieldDescription('allocatedQTY').text.toUpperCase() }}: </div>
                  <div class="mt-2 body-1">{{ fieldDescription('allocatedQTY').description }}</div>
                </span>
              </v-tooltip>
            </v-flex>

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.reOrderLevel"
                outline
                label="Re-Order Notification Level*"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
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

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.weight"
                outline suffix="grams"
                label="Variant Weight*"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{ new String("Variant Weight").toUpperCase() }}: </div>
                  <div class="mt-2 body-1">Weight of the variant, this weight will be used for shipping calculations.</div>
                </span>
              </v-tooltip>
            </v-flex>

            <v-flex xs10>
              <v-text-field
                v-model="selectedVariant.price"
                outline prefix="PHP "
                label="Variant Price*"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    <v-icon medium color="grey darken-3">help</v-icon>
                  </span>
                </template>
                <span>
                  <div class="font-weight-bold">{{ new String("Variant Price").toUpperCase() }}: </div>
                  <div class="mt-2 body-1">Price of this particular variant of a product.</div>
                </span>
              </v-tooltip>
            </v-flex>

            <v-flex xs10>
              <v-checkbox
                :label="`Is this variant OUT OF STOCK: ${selectedVariant.isOutofStock}`"
                v-model="selectedVariant.isOutofStock"
              ></v-checkbox>
            </v-flex>
            <v-flex xs1 offset-xs1 pb-4>
              <v-tooltip right max-width="150">
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
            </v-flex>

          </v-layout>
        </v-container>

        <v-divider class="my-2"></v-divider>

        <v-card-actions>
          <v-layout align-start justify-end wrap>
            <v-flex xs3>
              <v-btn color="red" dark @click="deleteVariant(selectedVariant)">DELETE VARIANT</v-btn>
            </v-flex>
            <v-flex xs2 offset-xs1>
              <v-btn color="green" dark 
                :loading="btnLoading" :disabled="btnLoading"
                @click="editVariant(selectedVariant)"
              >SAVE</v-btn>
            </v-flex>
            <v-flex xs2 offset-xs1>
              <v-btn outline @click="showEditDialog = false">CANCEL</v-btn>
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
        text: 'Edit Variant', align: 'center', value: '', sortable: false, fixed: true,
        description: 'Click the green icon to edit the details of a product variant.'
      },
      {
        text: 'Product Name', align: 'center', value: 'productName', sortable: true,
        description: 'The name of the product.'
      },
      {
        text: 'Variant Name', align: 'center', value: 'name', sortable: true, 
        description: 'Variant name of the product'
      },
      {
        text: 'QTY on Hand', align: 'center', value: 'onHandQTY', sortable: true, 
        description: 
          'When you receive or produce inventory, add that number to this total. ' + 
          'When these items leave your stock they are automatically subtracted '
      },
      {
        text: 'QTY Allocated', align: 'center', value: 'allocatedQTY', sortable: true, 
        description: 
        'This is the total number of your "QTY on Hand" inventory that have already been committed ' + 
        'to orders you have received from your Resellers.'
      },
      {
        text: 'QTY Available', align: 'center', value: 'availableQTY', sortable: true, 
        description: 
          'This is the inventory you have available and ready for new orders from your Resellers. ' + 
          'This value is generated by subtracting "QTY Allocated" from "QTY on Hand."'
      },
      {
        text: 'Re-Order Notif Level', align: 'center', value: 'reOrderLevel', sortable: true,
        description: 
          'Use this field to set the number of "QTY Available" inventory at which you would like to be notified to order / ' +
          'produce more inventory for this product. When the "QTY Available" number counts down to the number you set, ' +
          'this product will rise to the top of the page and a red notification badge will appear on your menu list ' +
          'next to the "Inventory Management" title.'
      },
      {
        text: 'Out of Stock?', align: 'center', value: 'isOutOfStock', sortable: false,
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
    showEditDialog: false,
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
        product.name = product.name.replace(/-/gi, ' / ');

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
      this.snackColor = state === 'success' ? 'primary' : 'red';
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
    async markAsOutOfStock(product) {
      this.loading = true;
      console.log('updating product: ', product);
      console.log(product)
      if(!product.isOutofStock) {
        this.openEditQuantityDialog(product)
      }
      try {
        await this.$store.dispatch('inventory/UPDATE_PRODUCT_DETAIL', {
          id: product.id,
          key: 'isOutofStock',
          value: product.isOutofStock
        });

        this.showSnackBar('success', `${product.sku} was successfully updated!`);
        this.textfieldLoading = false;

      } catch(error) {
        console.log('inventory management error: ', error.response);
        this.showSnackBar('error', `${product.sku} was not updated due to error!`);
        this.textfieldLoading = false;
      }

      this.loading = false;
    },

    openEditQuantityDialog(item) {
      this.showEditQuantityDialog = true;
      this.selectedVariant = Object.assign({}, item);
    },
    
    openEditDialog(item) {
      console.log(item)
      this.showEditDialog = true;
      this.selectedVariant = Object.assign({}, item);
    },

    async editVariant() {
      this.btnLoading = true;

      const { sku, onHandQTY, reOrderLevel, weight, price, isOutofStock } = this.selectedVariant;
      const updatedVariant = {
        sku, 
        onHandQTY, 
        reOrderLevel, 
        weight, 
        price,
        isOutofStock
      };

      try {
        await this.$store.dispatch('inventory/UPDATE_MULTIPLE_PRODUCT_FIELDS', {
          id: this.selectedVariant.id,
          updatedDetails: updatedVariant
        });

        this.btnLoading = false;
        this.showEditDialog = false;
        this.showSnackBar('success', `Updating ${this.selectedVariant.sku} was successful!`);
      } catch(error) {
        console.log('error in editVariant method: ', error);
        this.btnLoading = false;
        this.showEditDialog = false;
        this.showSnackBar('error', `Updating ${this.selectedVariant.sku} was not successful! Please try again.`);
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