<template>
  <v-container align-center justify-center>
    <v-layout align-center justify-center wrap row>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <v-layout align-center justify-start row wrap>
              <v-flex lg4 xs12>
                <div class="headline">Inventory Mangement</div>
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
          
          <v-container>
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
              <template slot="headerCell" slot-scope="props">
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
                  <td class="text-xs-left">{{props.item.name}}</td>
                  <td class="text-xs-left">{{props.item.category}}</td>
                  <td class="text-xs-center">
                    <v-edit-dialog
                      :return-value.sync="props.item.onHandQTY"
                      large lazy
                      @save="updateQTY('onHandQTY', props.item)" 
                    >
                      <div class="ml-4">
                        {{props.item.onHandQTY}}
                        <v-icon small class="ml-4">edit</v-icon>
                      </div>

                      <template v-slot:input>
                        <div class="mt-3 title">Update QTY on Hand</div>
                      </template>
                      <template v-slot:input>
                        <v-text-field
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
                      @save="updateQTY('reOrderLevel', props.item)" 
                    >
                      <div class="ml-4">
                        {{props.item.reOrderLevel}}
                        <v-icon small class="ml-4">edit</v-icon>
                      </div>

                      <template v-slot:input>
                        <div class="mt-3 title">Update Re-Order Notification Level</div>
                      </template>
                      <template v-slot:input>
                        <v-text-field
                          class="mt-4"
                          v-model="props.item.reOrderLevel"
                          label="Edit Re-Order Notification Level"
                          type="number"
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
    this.lading = false;
    
  },
  data: () => ({
    loading: false,
    textfieldLoading: false,
    search: null,
    headers: [
      {
        text: 'Name', align: 'left', value: 'name',
        description: 'The name of the product.'
      },
      {
        text: 'Category', align:'left', value: 'category',
        description: 'The category to which the product is included.'
      },
      {
        text: 'QTY on Hand', align: 'center', value: 'onHandQTY',
        description: 
          'When you receive or produce inventory, add that number to this total. ' + 
          'When these items leave your warehouse, they are automatically subtracted.'
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
        text: 'Re-Order Notification Level', align: 'center', value: 'reOrderLevel',
        description: 
          'Use this field to set the number of "QTY Available" inventory at which you would like to be notified to order / ' +
          'produce more inventory for this product. When the "QTY Available" number counts down to the number you set, ' +
          'this product will rise to the top of the page and a red notification badge will appear on your menu list ' +
          'next to the "Inventory Management" title.'
      },
      {
        text: 'Out of Stock?', align: 'left', value: 'isOutOfStock',
        description: 'Tick this box, to mark a product as "Out of Stock". \n' + 
          'But this box is automatically ticked, once "QTY on Hand" is zero.'
      },
    ],

    pagination: {
      sortBy: 'position',
    },
    rowsPerPageItems: [10, 20, 50, {text: 'All', value: -1}],

    snack: false,
    snackText: '',
    snackColor: 'primary',

  }),

  computed: {
    items() {
      return this.$store.getters['inventory/GET_ALL_PRODUCTS'];
    },

    products() {
      this.loading = true;
      const products = this.items;
      let modifiedProducts = [];
      modifiedProducts = products.map((product) => {
        const modifiedProduct = {};

        modifiedProduct.id = product.id;
        modifiedProduct.name = product.name;
        modifiedProduct.category = product.category;

        modifiedProduct.onHandQTY = product.onHandQTY;
        modifiedProduct.allocatedQTY = product.allocatedQTY;
        modifiedProduct.availableQTY = parseInt(modifiedProduct.onHandQTY) - parseInt(modifiedProduct.allocatedQTY);
        modifiedProduct.reOrderLevel = product.reOrderLevel;
        modifiedProduct.isOutofStock = product.isOutofStock;

        if(product.isOutofStock || modifiedProduct.availableQTY <= modifiedProduct.reOrderLevel) {
          modifiedProduct.position = 1;
        
        } else {
          modifiedProduct.position = 2;
        }

        if(modifiedProduct.availableQTY === 0) {
          modifiedProduct.isOutofStock = true;
        }
        
        return modifiedProduct;
      });

      this.loading = false;
      return modifiedProducts;
    }
  },

  watch: {
    
  },

  methods: {
    async updateQTY(QTYtype, product) {
      this.textfieldLoading = true;
      console.log('quantity type: ', QTYtype);
      console.log('updating product: ', product);

      try {

        await this.$store.dispatch('inventory/UPDATE_PRODUCT_DETAIL', {
          id: product.id,
          key: QTYtype,
          value: Number(product[QTYtype])
        });

        this.snack = true;
        this.snackText = `${product.name} was successfully updated!`;
        this.snackColor="primary";
        this.textfieldLoading = false;

      } catch(error) {
        console.log('inventory management error: ', error.response);
        this.snack = true;
        this.snackText = `${product.name} was not updated due to error!`;
        this.snackColor="red";
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

        this.snack = true;
        this.snackText = `${product.name} was successfully updated!`;
        this.snackColor="primary";
        this.textfieldLoading = false;

      } catch(error) {
        console.log('inventory management error: ', error.response);
        this.snack = true;
        this.snackText = `${product.name} was not updated due to error!`;
        this.snackColor="red";
        this.textfieldLoading = false;
      }

      this.loading = false;
    },
  },

}
</script>

<style>

</style>