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
                <v-tooltip bottom max-width="150">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      {{ props.header.text }}
                    </span>
                  </template>
                  <span>
                    {{ props.header.description }}
                  </span>
                </v-tooltip>
              </template>

              <template v-slot:items="props">
                <tr 
                  :class="[ 
                    props.item.position === 1 ? 'red lighten-3' : '',
                  ]"
                >

                  <td class="text-xs-left">{{props.item.productName}}</td>

                  <td class="text-xs-left">{{props.item.name}}</td>

                  <td class="text-xs-center">
                    <v-edit-dialog
                      :return-value.sync="props.item.sku"
                      large lazy
                      @save="updateVariantField('sku', props.item)" 
                    >
                      <div>
                        {{props.item.sku}}&nbsp;
                        <v-divider class="my-1 black"></v-divider>
                        <!-- <v-icon small>edit</v-icon> -->
                      </div>

                      <template v-slot:input>
                        <div class="mt-3 title">Update Variant SKU</div>
                      </template>
                      <template v-slot:input>
                        <v-text-field
                          autofocus 
                          v-model="props.item.sku"
                          label='Edit Variant SKU'
                          class="mt-4"
                          :loading="textfieldLoading"
                          :disabled="textfieldLoading"
                        ></v-text-field>
                      </template>
                    </v-edit-dialog>
                  </td>

                  <td class="text-xs-center">
                    <v-edit-dialog
                      :return-value.sync="props.item.onHandQTY"
                      large lazy
                      @save="updateVariantField('onHandQTY', props.item)" 
                    >
                      <div class="ml-4">
                        {{props.item.onHandQTY}}&nbsp;
                        <v-divider class="my-1 black"></v-divider>
                        <!-- <v-icon small class="ml-4">edit</v-icon> -->
                      </div>

                      <template v-slot:input>
                        <div class="mt-3 title">Update QTY on Hand</div>
                      </template>
                      <template v-slot:input>
                        <v-text-field
                          autofocus
                          v-model="props.item.onHandQTY"
                          label='Edit QTY on Hand'
                          class="mt-4" type="number"
                          :loading="textfieldLoading"
                          :disabled="textfieldLoading"
                        ></v-text-field>
                      </template>
                    </v-edit-dialog>
                  </td>

                  <td class="text-xs-center">{{props.item.allocatedQTY}}</td>

                  <td class="text-xs-center">{{props.item.availableQTY}}</td>

                  <td class="text-xs-center">
                    <v-edit-dialog
                      :return-value.sync="props.item.reOrderLevel"
                      large lazy
                      @save="updateVariantField('reOrderLevel', props.item)" 
                    >
                      <div class="ml-4">
                        {{props.item.reOrderLevel}}&nbsp;
                        <v-divider class="my-1 black"></v-divider>
                        <!-- <v-icon small class="ml-4">edit</v-icon> -->
                      </div>

                      <template v-slot:input>
                        <div class="mt-3 title">Update Re-Order Notification Level</div>
                      </template>
                      <template v-slot:input>
                        <v-text-field
                          class="mt-4"
                          autofocus
                          v-model="props.item.reOrderLevel"
                          label="Edit Re-Order Notification Level"
                          type="number"
                          :loading="textfieldLoading"
                          :disabled="textfieldLoading"
                        ></v-text-field>
                      </template>
                    </v-edit-dialog>
                  </td>

                  <td class="text-xs-center">
                    <v-edit-dialog
                      :return-value.sync="props.item.weight"
                      large lazy
                      @save="updateVariantField('weight', props.item)" 
                    >
                      <div>
                        {{props.item.weight}} g.&nbsp;
                        <v-divider class="my-1 black"></v-divider>
                        <!-- <v-icon small class="ml-4">edit</v-icon> -->
                      </div>

                      <template v-slot:input>
                        <div class="mt-3 title">Update Variant Weight</div>
                      </template>
                      <template v-slot:input>
                        <v-text-field
                          class="mt-4"
                          autofocus
                          v-model="props.item.weight"
                          label="Edit Variant Weight"
                          type="number" suffix="grams"
                          :loading="textfieldLoading"
                          :disabled="textfieldLoading"
                        ></v-text-field>
                      </template>
                    </v-edit-dialog>
                  </td>

                  <td class="text-xs-center">
                    <v-edit-dialog
                      :return-value.sync="props.item.price"
                      large lazy 
                      @save="updateVariantField('price', props.item)" 
                    >
                      <div>
                        {{props.item.price | currency("P ") }}&nbsp;
                        <v-divider class="my-1 black"></v-divider>
                        <!-- <v-icon small class="ml-4">edit</v-icon> -->
                      </div>

                      <template v-slot:input>
                        <div class="mt-3 title">Update Variant Price</div>
                      </template>
                      <template v-slot:input>
                        <v-text-field
                          class="mt-4" autofocus
                          v-model="props.item.price"
                          label="Edit Variant Price"
                          type="number" prefix="PHP"
                          :loading="textfieldLoading"
                          :disabled="textfieldLoading"
                        ></v-text-field>
                      </template>
                    </v-edit-dialog>
                  </td>

                  <td class="pt-4">
                    <v-checkbox
                      class="ml-4"
                      @change="markAsOutOfStock(props.item)"
                      v-model="props.item.isOutofStock"
                    ></v-checkbox>
                  </td>

                  <td>
                    <v-icon medium color="primary" class="ml-4" 
                      @click="deleteVariant(props.item)">delete_forever</v-icon>
                  </td>
                </tr>
              </template>
            </v-data-table>  
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>

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
        text: 'Product Name', align: 'left', value: 'productName',
        description: 'The name of the product.'
      },
      {
        text: 'Variant Name', align: 'left', value: 'name',
        description: 'Variant name of the product'
      },
      {
        text: 'Variant SKU', align: 'left', value: 'sku',
        description: 'Variant SKU of the product.'
      },
      {
        text: 'QTY on Hand', align: 'center', value: 'onHandQTY',
        description: 
          'When you receive or produce inventory, add that number to this total. ' + 
          'When these items leave your stock they are automatically subtracted '
      },
      {
        text: 'QTY Allocated', align: 'center', value: 'allocatedQTY',
        description: 
        'This is the total number of your "QTY on Hand" inventory that have already been committed ' + 
        'to orders you have received from your Resellers.'
      },
      {
        text: 'QTY Available', align: 'center', value: 'availableQTY',
        description: 
          'This is the inventory you have available and ready for new orders from your Resellers. ' + 
          'This value is generated by subtracting "QTY Allocated" from "QTY on Hand."'
      },
      {
        text: 'Re-Order Notif Level', align: 'center', value: 'reOrderLevel',
        description: 
          'Use this field to set the number of "QTY Available" inventory at which you would like to be notified to order / ' +
          'produce more inventory for this product. When the "QTY Available" number counts down to the number you set, ' +
          'this product will rise to the top of the page and a red notification badge will appear on your menu list ' +
          'next to the "Inventory Management" title.'
      },
      {
        text: 'Variant Weight', align: 'left', value: 'weight',
        description: 'Weight of the variant, this weight will be used for shipping calculations.'
      },
      {
        text: 'Variant Price', align: 'left', value: 'price',
        description: 'Price of this particular variant of a product.'
      },
      {
        text: 'Out of Stock?', align: 'left', value: 'isOutOfStock',
        description: 'Tick this box, to mark a product as "Out of Stock". \n' + 
          'But this box is automatically ticked, once "QTY on Hand" is zero.'
      },
      {
        text: 'Delete This Variant?', align: 'left', value: 'productId',
        description: 'Click this icon to delete this variant in your inventory.'
      },
    ],

    pagination: {
      sortBy: 'position',
      rowsPerPage: -1,
    },
    rowsPerPageItems: [10, 20, 50, {text: 'All', value: -1}],

    snack: false,
    snackText: '',
    snackColor: 'primary',

  }),

  computed: {

    products() {
      this.loading = true;
      const products = [...this.$store.getters['inventory/GET_ALL_PRODUCTS']];

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
        await this.$store.dispatch('inventory/DELETE_PRODUCT', item.id);
        
        this.showSnackBar('success', `${item.sku} was successfully deleted!`);
        this.textfieldLoading = false;

      } catch(error) {
        console.log('inventory management error: ', error.response);
        this.showSnackBar('error', `${item.sku} was not deleted!`);
        this.textfieldLoading = false;
      }
    }
  },

}
</script>

<style>

</style>