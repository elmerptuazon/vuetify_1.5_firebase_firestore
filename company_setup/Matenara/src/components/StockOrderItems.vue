<template>
  <v-data-table
    hide-actions
    :headers="headers"
    :items="products"
    :loading="loading"
    :search="search"
  >
    <template slot="items" slot-scope="props">
      <tr>
        <td class="text-xs-center pa-2">
          <v-avatar size="50px" tile>
            <v-img :src="props.item.image" contain width="50"></v-img>
          </v-avatar>
        </td>
        <td class="text-xs-left">{{ props.item.name }}</td>
        <td class="text-xs-left">{{ (props.item.attributes || '-') | capitalize }}</td>
        <td class="text-xs-left">{{ props.item.sku }}</td>
        <td class="text-xs-center">{{ props.item.qty }}</td>
        <td class="text-xs-center">{{ props.item.shippedQty }}</td>
        <td class="text-xs-center">{{ props.item.remainingQty }}</td>
        <td class="text-xs-center">{{ props.item.total | currency("&#8369;") }}</td>
      </tr>
    </template>
    <template slot="footer">
      <tr>
        <td colspan="8" class="text-xs-right">
          <strong>Total: {{ total | currency("&#8369;") }}</strong>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
export default {
  props: ["items", "loading"],
  data: () => ({
    search: null,
    headers: [
      {
        text: "Thumbnail",
        align: "center",
        sortable: false,
        value: "id"
      },
      {
        text: "Name",
        value: "name",
        align: "left"
      },
      {
        text: "Variant",
        value: "attributes",
        align: "left"
      },
      {
        text: "Variant SKU",
        value: "sku",
        align: "left"
      },
      {
        text: "Order Qty",
        value: "qty",
        align: "center"
      },
      {
        text: "Shipped Qty",
        value: "shippedQty",
        align: "center"
      },
      {
        text: "Remaining Qty",
        value: "remainingQty",
        align: "center"
      },
      {
        text: "Total",
        value: "total",
        align: "center"
      }
    ]
  }),

  computed: {
    products() {
      const data = this.items.map(item => {
        let attributes = "";
        Object.keys(item.attributes).forEach(attr => {
          if (attr !== "qty" && attr !== "quantity") {
            attributes += `${item.attributes[attr]}`;
          }
        });

        return {
          qty: item.qty,
          shippedQty: item.shippedQty,
          remainingQty: item.qty - item.shippedQty,
          price: item.resellerPrice,
          total: item.qty * item.resellerPrice,
          name: item.name,
          attributes: attributes,
          image: item.downloadURL,
          sku: item.sku,
          variantId: item.variantId,
          variantName: item.variantName
        };
      });

      return data;
    },

    subTotal() {
      return this.items.reduce((a, b) => a + b.resellerPrice * b.qty, 0);
    },

    discount() {
      let discount;
      // if (this.subTotal >= 1500 && this.subTotal <= 2999) {
      // 	discount = 10;
      // } else if (this.subTotal >= 3000 && this.subTotal <= 4999) {
      // 	discount = 15;
      // } else if (this.subTotal >= 5000 && this.subTotal <= 9999) {
      // 	discount = 18;
      // } else if (this.subTotal >= 10000 && this.subTotal <= 24999) {
      // 	discount = 20;
      // } else {
      // 	discount = null;
      // }
      return discount;
    },

    total() {
      if (this.discount) {
        return this.subTotal - (this.discount / 100) * this.subTotal;
      } else {
        return this.subTotal;
      }
    }
  }
};
</script>
