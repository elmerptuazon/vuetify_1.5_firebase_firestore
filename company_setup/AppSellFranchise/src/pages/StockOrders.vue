<template>
  <v-container fluid>
    <v-card>
      <v-container fluid>
        <v-layout align-center justify-start row>
          <v-flex xs3>
            <div class="headline">
              Stock Orders
              <span>
                <v-tooltip bottom color="primary" dark>
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                      <v-icon color="grey lighten-1">help</v-icon>
                    </v-btn>
                  </template>
                  <span>
                    <b>NOTE:</b> New Stock Orders are automatically shown on top of the list in real-time,<br/> 
                    please refrain from refreshing this page.
                  </span>
                </v-tooltip>
              </span>
            </div>
          </v-flex>
          
          <v-flex xs8 offset-xs2>
            <v-text-field
              append-icon="search"
              label="Search stock order..."
              dense
              v-model="search"
            ></v-text-field>
          </v-flex>
        </v-layout>
        
        <v-layout align-center justify-start mt-4>
          <div 
            v-for="status in statuses"
            :key="status.name"
            class="mr-1"
          >
            <v-chip
              :active="status.count"
              :class="[status.count === 0 ? 'grey' : 'primary']"
              :outline="status.count === 0"
              dark small
            >
              <div class="font-weight-thin overline">
                {{ status.name }} Orders 
                <span class="font-weight-bold">
                  : {{ status.count }}
                </span>
              </div>
            </v-chip>
          </div>
        </v-layout>
      </v-container>
      
      <v-divider class="my-1"/>

      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="items"
        item-key="id"
        class="elevation-1"
        :loading="loading"
        :loading-text="loadingText"
        :search="search"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
      >
        <template slot="items" slot-scope="props">
          <tr
            @click="view(props.item)"
            :class="[
              props.item.position === 1 ? 'red lighten-3' : '',
              props.item.position === 2 ? 'blue lighten-4' : '',
              props.item.position === 3 ? 'grey lighten-2' : '',
            ]"
          >
            <td>
              {{ props.item.stockOrderReference }}
            </td>
            <td>
              {{ props.item.user.branchName }}
            </td>
            <td class="text-xs-center">
              {{ props.item.user.address.citymun }}
            </td>
            <td class="text-xs-center">
              {{ props.item.user.address.province }}
            </td>
            <td class="text-xs-center">{{ props.item.submittedAt | momentize("D-MMM-YYYY") }}</td>
            <td class="text-xs-center">{{ props.item.sku }}</td>
            <td class="text-xs-center">
              <span 
                v-if="
                  (props.item.status.toLowerCase() === 'shipped' || props.item.status.toLowerCase() === 'partially shipped') &&
                  props.item.shipmentsToReceive > 0
                "
              >{{ 'scheduled for shipping' | uppercase }}</span>
              <span v-else>{{ props.item.status | uppercase }}</span>
            </td>
            <!-- <td>{{ props.item.discountedTotal | currency("P") }}</td> -->
            <td class="text-xs-center">
              <span v-if="props.item.paymentDetails.paymentStatus === 'pending'"> PROOF OF PAYMENT </span>
              <span v-else>{{ props.item.paymentDetails.paymentStatus | uppercase }}</span>
            </td>
            <td class="text-xs-center">{{ props.item.price | currency("&#8369;") }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import mixins from "@/mixins";
import { DB } from "@/config/firebase";
import { mapGetters } from 'vuex';
const ordersCollection = DB.collection("orders");

export default {
  data: () => ({
    // items: [],
    loading: false,
    loadingText: 'Please Wait...',
    search: null,
    rowsPerPageItems: [10, 20, 30, { text: "All", value: -1 }],
    selected: [],
    pagination: {
      sortBy: "position"
    },
    headers: [
      {
        text: "Reference No.",
        value: "stockOrderReference"
      },
      {
        text: "Branch Name",
        value: "user.branchName"
      },
      {
        text: "City",
        value: "user.address.citymun",
        align: 'center'
      },
      {
        text: "Province",
        value: "user.address.province",
        align: 'center'
      },
      {
        text: "Order Date",
        value: "submittedAt",
        align: 'center'
      },
      {
        text: "#SKU",
        value: "sku",
        align: 'center'
      },
      {
        text: "Shipment Status",
        value: "status",
        align: 'center'
      },
      {
        text: "Payment Status",
        value: "paymentDetails.paymentStatus",
        align: 'center'
      },
      {
        text: "Price",
        value: "price",
        align: 'center'
      }
    ],
    statuses: [],
    statusType: ['Unread', 'Pending', 'Processing', 'Partially Shipped', 'Fully Shipped', 'Cancelled'],
  }),
  async created() {
    this.loading = true;
    // try {
    //   const data = await this.$store.dispatch("stock_orders/FIND");
    //   this.items = data.map(order => {
    //     console.log(order);
    //     order.discountedTotal = this.applyDiscount(order.resellerPrice);
    //     return order;
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
    this.loading = false;
  },
  methods: {
    async view(item) {
      console.log(item);
      this.loading = true;
      await this.$store.dispatch(
        "stock_orders/POPULATE_STOCK_ORDER_ITEMS",
        item
      );

      this.$router.push({
        name: "StockOrderDetails",
        params: { id: item.id }
      });
      this.loading = false;
    },

    computeStatusNumbers(orders) {
      this.statuses = [];
      this.statusType.forEach(status => {
        let entry = {
          name: status,
        }
  
        if(status === 'Unread') {
          entry.count = orders.filter(order => order.status.toLowerCase() === 'pending' && !order.isRead).length;
        }
        else {
          entry.count = orders.filter(order => order.status.toLowerCase() === status.toLowerCase()).length;
        }

        this.statuses.push(entry);
      });
    },

    applyDiscount(total) {
      let discount;
      // if (total >= 1500 && total <= 2999) {
      //   discount = 10;
      // } else if (total >= 3000 && total <= 4999) {
      //   discount = 15;
      // } else if (total >= 5000 && total <= 9999) {
      //   discount = 18;
      // } else if (total >= 10000 && total <= 24999) {
      //   discount = 20;
      // } else {
      //   discount = null;
      // }

      if (discount) {
        return total - (discount / 100) * total;
      } else {
        return total;
      }
    }
  },
  mixins: [mixins],
  computed: {
    items() {
      const stockOrderList = this.$store.getters['stock_orders/GET_STOCK_ORDER_LIST'];
      const stockOrders = stockOrderList.map(stockorder => {
        if(!stockorder.isRead && stockorder.paymentDetails.paymentStatus === 'pending') {
          stockorder.position = 1;
        
        } else if(!stockorder.isRead && stockorder.status.toLowerCase() === 'pending') {
          stockorder.position = 2;
        
        } else if(stockorder.isRead && stockorder.status.toLowerCase() === 'pending') {
          stockorder.position = 3;
        
        } else {
          stockorder.position = 4;
        } 

        return stockorder;
      });

      this.computeStatusNumbers(stockOrders);
      return stockOrders;
    }
  },

};
</script>
