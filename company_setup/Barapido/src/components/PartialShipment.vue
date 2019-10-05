<template>
  <v-data-table
    hide-actions
    :headers="headers"
    :items="shipmentDetails"
    :loading="loading"
  >
    <template slot="items" slot-scope="props">
      <tr>
        <td class="text-xs-center pa-2">
          <v-avatar size="50px" tile>
            <v-img :src="props.item.image" contain width="50"></v-img>
          </v-avatar>
        </td>
        <td class="text-xs-left">{{ props.item.name }}</td>
        <td class="text-xs-left">
          {{ props.item.attributesString | capitalize }}
        </td>
        <td class="text-xs-center">{{ props.item.qty }}</td>
        <td class="text-xs-center">{{ props.item.shippedQty }}</td>
        <td class="text-xs-center">{{ props.item.qtyToShip }}</td>
        <td class="text-xs-center">
          <v-icon small @click="DeleteItem(props.item)">
            delete
          </v-icon>
        </td>
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
                        :items="products"
                        item-text="name"
                        item-value="name"
                        label="Ordered Products"
                        solo
                        return-object
                      ></v-select>
                    </v-flex>
                    <v-flex xs4>
                      <!-- <v-text-field
                        readonly
                        label="Order QTY"
                        v-model="selectedItem.qty"
                      >
                      </v-text-field> -->
                      <div>
                        <span class="font-weight-bold">
                          Order QTY
                        </span>
                        <br/>
                        <span>
                          {{ selectedItem.qty || "-" }}
                        </span>
                      </div>
                    </v-flex>
                    <v-flex xs4>
                      <!-- <v-text-field
                        readonly
                        label="Shipped QTY"
                        v-model="selectedItem.shippedQty"
                      ></v-text-field> -->
                      <div>
                        <span class="font-weight-bold">
                          Shipped QTY
                        </span>
                        <br/>
                        <span>
                          {{ selectedItem.qty || "-" }}
                        </span>
                      </div>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        mask="######"
                        v-model.number="selectedItem.qtyToShip"
                        label="QTY to Ship"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click="dialog = false"
                  >Cancel</v-btn
                >
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
        value: "attributesString",
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
      },
      {
        text: "Actions",
        value: "name",
        sortable: false,
        align: "center"
      }
    ]
  }),
  created() {},
  methods: {
    DeleteItem(item) {
      const index = this.shipmentDetails.indexOf(item);
      confirm("Are you sure you want to delete this item?") &&
        this.shipmentDetails.splice(index, 1);
    },

    async AddShipmentDetails() {
      if (typeof this.selectedItem.qtyToShip === "undefined") {
        this.$swal.fire({
          type: "info",
          title: "Items to Ship",
          text: "Please select an item and indicate how many items to ship."
        });

        return;
      }
      console.log(this.selectedItem);
      const maxNumberOfItemToShip =
        this.selectedItem.qty - this.selectedItem.shippedQty;
      if (
        parseInt(this.selectedItem.qtyToShip) < 1 ||
        this.selectedItem.qtyToShip === ""
      ) {
        this.$swal.fire({
          type: "info",
          title: "Items to Ship",
          text: "Please input how many items to ship."
        });

        return;
      } else if (maxNumberOfItemToShip < this.selectedItem.qtyToShip) {
        this.$swal.fire({
          type: "info",
          title: "Items to Ship",
          text: "Maximum number of items allowed to ship exceeded!"
        });
        this.selectedItem.qtyToShip = 0;
        return;
      } else {
        this.shipmentDetails.push(Object.assign({}, this.selectedItem));
      }

      this.dialog = false;
      //console.log(this.shipmentDetails);
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
          attributes: item.attributes,
          attributesString: attributes,
          image: item.downloadURL,
          productId: item.productId,
          price: item.resellerPrice
        };
      });

      return data;
    }
  },
  watch: {
    shipmentDetails(values) {
      this.$emit("itemsToShip", values);
    }
  }
};
</script>
