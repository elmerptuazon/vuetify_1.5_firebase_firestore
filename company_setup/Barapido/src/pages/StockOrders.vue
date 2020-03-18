<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <div class="headline">Stock Orders</div>
        <v-spacer></v-spacer>
        <v-text-field
          append-icon="search"
          label="Search stock order..."
          single-line
          hide-details
          v-model="search"
        ></v-text-field>
      </v-card-title>
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
            :class="[props.item.status === 'pending' ? 'blue lighten-4' : '']"
          >
            <td>
              {{ props.item.stockOrderReference }}
            </td>
            <td>
              {{ props.item.user.firstName }}
            </td>
            <td>
              {{ props.item.user.middleInitial || "" }}
            </td>
            <td>
              {{ props.item.user.lastName }}
            </td>
            <td>
              {{ props.item.user.address.citymun }}
            </td>
            <td>
              {{ props.item.user.address.province }}
            </td>
            <td>{{ props.item.submittedAt | momentize("D-MMM-YYYY") }}</td>
            <td>{{ props.item.sku }}</td>
            <td>{{ props.item.status | uppercase }}</td>
            <!-- <td>{{ props.item.discountedTotal | currency("P") }}</td> -->
            <td>{{ props.item.resellerPrice | currency("P") }}</td>
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
      sortBy: "Order Date"
    },
    headers: [
      {
        text: "Reference No.",
        value: "stockOrderReference"
      },
      {
        text: "First Name",
        value: "user.firstName"
      },
      {
        text: "Middle Name",
        value: "user.middleInitial"
      },
      {
        text: "Last Name",
        value: "user.lastName"
      },
      {
        text: "City",
        value: "user.address.citymun"
      },
      {
        text: "Province",
        value: "user.address.province"
      },
      {
        text: "Order Date",
        value: "submittedAt"
      },
      {
        text: "#SKU",
        value: "sku"
      },
      {
        text: "Status",
        value: "status"
      },
      {
        text: "Price",
        value: "resellerPrice"
      }
    ]
  }),
  async created() {
    this.loading = true;
    try {
      await this.$store.dispatch("stock_orders/FIND");
      // const data = await this.$store.dispatch("stock_orders/FIND");
      // this.items = data.map(order => {
      //   console.log(order);
      //   order.discountedTotal = this.applyDiscount(order.resellerPrice);
      //   return order;
      // });
    } catch (error) {
      console.log(error);
    }
    this.loading = false;
  },
  methods: {
    async view(item) {
      console.log(item);
      await this.$store.dispatch(
        "stock_orders/POPULATE_STOCK_ORDER_ITEMS",
        item
      );
      this.$router.push({
        name: "StockOrderDetails",
        params: { id: item.id }
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
    ...mapGetters({
      items: 'stock_orders/GET_STOCK_ORDER_LIST',
    })
  },
};
</script>
