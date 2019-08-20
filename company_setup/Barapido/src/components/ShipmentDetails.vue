<template>
  <v-data-table
    hide-actions
    :headers="headers"
    :items="shipmentDetails"
    :loading="loading"
    :search="search"
  >
    <template slot="items" slot-scope="props">
      <tr>
        <td class="text-xs-center pa-2">
          <v-avatar size="50px" tile>
            <v-img :src="props.item.downloadURL" contain width="50"></v-img>
          </v-avatar>
        </td>
        <td class="text-xs-left">{{ props.item.name }}</td>
        <td class="text-xs-left">{{ props.item.attributes | capitalize }}</td>
        <td class="text-xs-center">{{ props.item.qty }}</td>
        <td class="text-xs-center">{{ props.item.shippedQty }}</td>
        <td class="text-xs-center">{{ props.item.qtyToShip }}</td>
      </tr>
    </template>
    <template slot="footer">
      <tr>
        <td colspan="7" class="text-xs-right">
          <v-btn color="primary" dark class="mb-2" @click="dialog = true"
            >New Item</v-btn
          >
          <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-select
                        v-model="selectedItem"
                        :items="items"
                        item-text="name"
                        item-value="name"
                        label="Ordered Products"
                        solo
                        return-object
                      ></v-select>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        label="Order QTY"
                        v-model="selectedItem.qty"
                      >
                      </v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        label="Shipped QTY"
                        v-model="selectedItem.shippedQty"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        v-model="selectedItem.qtyToShip"
                        label="QTY to Ship"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat>Cancel</v-btn>
                <v-btn color="blue darken-1" @click="AddShipmentDetails" flat
                  >Add Shipment Details</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
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
    shipmentDetails: [],
    dialog: false,
    selectedItem: {},
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
        align: "center"
      },
      {
        text: "Attributes",
        value: "attributes",
        align: "center"
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
        text: "QTY to Ship",
        value: "qtyToShip",
        align: "center"
      }
    ]
  }),
  created() {},
  methods: {
    async AddShipmentDetails() {
      this.shipmentDetails.push(this.selectedItem);

      console.log(this.shipmentDetails);
    }
  },
  computed: {
    products() {
      const data = this.items.map(item => {
        let attributes = "";
        Object.keys(item.attributes).forEach(attr => {
          if (attr !== "qty" && attr !== "quantity") {
            attributes += `${attr}: ${item.attributes[attr]}`;
          }
        });

        return {
          qty: item.qty,
          shippedQty: item.shippedQty,
          remainingQty: item.qty - item.shippedQty,
          name: item.name,
          attributes: attributes,
          image: item.downloadURL
        };
      });

      return data;
    }
  }
};
</script>
