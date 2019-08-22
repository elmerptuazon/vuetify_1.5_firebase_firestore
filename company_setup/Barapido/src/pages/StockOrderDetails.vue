<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <v-btn icon @click="$router.go(-1)">
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <div class="headline">Stock Order Details</div>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text>
        <v-layout align-center justify-space-around row wrap>
          <v-flex xs12 s12 md8 lg8 xl8>
            <v-container
              ><v-card>
                <v-card-title>
                  <v-list class="pa-0">
                    <v-list-tile avatar>
                      <v-list-tile-avatar>
                        <v-img
                          v-if="item.user.downloadURL"
                          :src="item.user.downloadURL"
                        ></v-img>
                        <v-img v-else :src="userPlaceholder"></v-img>
                      </v-list-tile-avatar>

                      <v-list-tile-content>
                        <v-list-tile-title>
                          {{ item.user.firstName }}
                          {{ item.user.middleInitial || "" }}
                          {{ item.user.lastName }} -
                          {{ item.user.agentId }}</v-list-tile-title
                        >
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-list subheader>
                    <v-list-tile>
                      <v-list-tile-content>
                        <v-list-tile-sub-title
                          >Reference Number</v-list-tile-sub-title
                        >
                        <v-list-tile-title>{{
                          item.stockOrderReference
                        }}</v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile
                      ><v-list-tile-content>
                        <v-list-tile-sub-title>Address</v-list-tile-sub-title>
                        <v-list-tile-title
                          >{{ item.user.address.house }}
                          {{ item.user.address.streetName }},
                          {{ item.user.address.citymun }},
                          {{ item.user.address.province }}</v-list-tile-title
                        >
                      </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile
                      ><v-list-tile-content>
                        <v-list-tile-sub-title
                          >Order Date</v-list-tile-sub-title
                        >
                        <v-list-tile-title>{{
                          item.submittedAt | momentize("DD-MMM-YYYY")
                        }}</v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile
                      ><v-list-tile-content>
                        <v-list-tile-sub-title>Status</v-list-tile-sub-title>
                        <v-list-tile-title>
                          <span class="primary--text">{{
                            item.status | uppercase
                          }}</span></v-list-tile-title
                        >
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                </v-card-text>
              </v-card></v-container
            >
          </v-flex>
          <v-flex xs12 s12 md4 lg4 xl4>
            <v-container
              ><v-select
                :items="status"
                v-model="selectedStatus"
                label="Update Status"
              ></v-select>
              <div class="text-xs-center">
                <v-btn
                  v-if="
                    item.status === 'paid' ||
                      item.status === 'partially shipped'
                  "
                  @click="shipmentDialog = true"
                  >Ship this Stock Order</v-btn
                >
              </div>
            </v-container>
          </v-flex>
        </v-layout>
        <div class="mb-2"></div>
        <v-card>
          <v-card-title class="title">Order Details</v-card-title>
          <v-divider></v-divider>
          <StockOrderItems :items="item.items" :loading="loading" />
        </v-card>
      </v-card-text>
      <v-divider></v-divider>
      <!-- <v-card-actions v-if="item.status === 'pending'">
				<v-spacer></v-spacer>
				<v-btn color="green" dark large @click="updateStatus('delivered')">DELIVERED</v-btn>
				<v-btn color="green" outline dark large @click="updateStatus('collected')">COLLECTED</v-btn>
			</v-card-actions> -->
    </v-card>
    <div class="mb-2"></div>
    <v-card>
      <v-card-title class="title">Shipment Details</v-card-title>
      <ShipmentDetails :stockOrderId="item.id" />
    </v-card>

    <v-dialog v-model="shipmentDialog" max-width="900">
      <v-card>
        <v-container grid-list-md>
          <v-card-title class="title">
            Create Shipment
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-layout wrap>
              <v-flex xs12>
                <v-radio-group v-model="shipmentType" row>
                  <v-radio label="Full Shipment" value="Full"></v-radio>
                  <v-radio label="Partial Shipment" value="Partial"></v-radio>
                  <PartialShipment
                    v-if="shipmentType == 'Partial'"
                    :items="item.items"
                    :loading="loading"
                    @itemsToShip="SetItemsToShip"
                  />
                </v-radio-group>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="SubmitShipment">
              Submit Shipment
            </v-btn>
            <v-btn @click="shipmentDialog = false">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
    <Toast ref="toast" />
  </v-container>
</template>

<script>
import mixins from "@/mixins";
import { DB } from "@/config/firebase";
import userPlaceholder from "@/assets/placeholder.png";
import AccountData from "@/components/AccountData";
import Toast from "@/components/Toast";
import StockOrderItems from "@/components/StockOrderItems";
import ShipmentDetails from "@/components/ShipmentDetails";
import PartialShipment from "@/components/PartialShipment";
import { async } from "q";

export default {
  data: () => ({
    loading: false,
    item: {},
    status: ["Processing", "Paid", "Cancelled"],
    itemsToShip: [],
    shipmentDialog: false,
    shipmentType: "Full",
    shipmentDetails: null,
    partialShipment: false,
    selectedStatus: null
  }),
  async created() {
    this.loading = true;
    try {
      const { id, item } = this.$route.params;

      if (id) {
        this.item = item;
        const items = [];
        for (const product of item.items) {
          const data = (await DB.collection("products")
            .doc(product.productId)
            .get()).data();
          product.downloadURL = data.downloadURL;
          product.name = data.name;
          if (typeof product.shippedQty === "undefined") {
            product.shippedQty = 0;
          }
          items.push(product);
        }
        this.item.items = items;
      } else {
        this.$router.push({ name: "StockOrders" });
      }
    } catch (error) {
      this.$refs.toast.show("error", "An error occurred");
      console.log(error);
    }
    this.loading = false;
  },
  methods: {
    SetItemsToShip(items) {
      this.itemsToShip = items.map(item => {
        const itemToShip = {
          attributes: item.attributes,
          qtyToShip: item.qtyToShip,
          productName: item.name,
          productId: item.productId
        };
        return itemToShip;
      });

      console.log(this.itemsToShip);
    },
    async updateStatus(status) {
      try {
        if (this.item.statusTimeline) {
          this.item.statusTimeline.push({
            status: status,
            date: Date.now()
          });
        } else {
          this.item.statusTimeline = [{ status: status, date: Date.now() }];
        }

        await this.$store.dispatch("stock_orders/UPDATE_STATUS", {
          status: status,
          statusTimeline: this.item.statusTimeline,
          id: this.$route.params.id
        });

        this.item.status = status;
        this.$refs.toast.show(
          "success",
          "Order has been successfully marked as " + status
        );
      } catch (error) {
        this.$refs.toast.show("error", "An error occurred");
        console.log(error);
      }
    },
    async SubmitShipment() {
      const response = await this.$swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Submit it!"
      });
      if (response.value) {
        if (this.shipmentType === "Full") {
          //pass shipment details to vuex that inserts to database
          try {
            const itemsToShip = this.item.items.map(item => {
              //console.log(item);
              const itemToShip = {
                attributes: item.attributes,
                qtyToShip: item.qty - item.shippedQty,
                productName: item.name,
                productId: item.productId
              };
              return itemToShip;
            });
            this.shipmentDetails = {
              stockOrder: {
                stockOrderReference: this.item.stockOrderReference,
                stockOrderId: this.item.id
              },
              userDetails: {
                firstName: this.item.user.firstName,
                lastName: this.item.user.lastName,
                middleInitial: this.item.user.middleInitial,
                email: this.item.user.email,
                contact: this.item.user.contact,
                userId: this.item.user.id,
                address: this.item.user.address
              },
              dateSubmitted: Date.now(),
              itemsToShip: itemsToShip,
              type: "Full Shipment",
              status: "Pending"
            };
            //call vuex and pass this.shipmentDetails
            const response = await this.$store.dispatch(
              "shipment/SubmitShipment",
              this.shipmentDetails
            );
            //console.log(response);
            //after saving the Shipment Details, Update the Stock Order Values and Status
            const remainingStockOrderItems = this.item.items.map(item => {
              const updatedStockOrder = {
                attributes: item.attributes,
                price: item.price,
                productId: item.productId,
                qty: item.qty,
                unique: item.unique,
                resellerPrice: item.resellerPrice,
                shippedQty: item.qty - item.shippedQty + item.shippedQty
              };
              return updatedStockOrder;
            });
            console.log(remainingStockOrderItems);
            this.item.statusTimeline.push({
              status: "shipped",
              date: Date.now()
            });
            const stockOrderUpdatedData = {
              status: "shipped",
              items: remainingStockOrderItems,
              statusTimeline: this.item.statusTimeline,
              id: this.item.id
            };

            const stockOrderUpdateResponse = await this.$store.dispatch(
              "stock_orders/UPDATE_STOCK_ORDER_DETAILS",
              stockOrderUpdatedData
            );

            //console.log(stockOrderUpdateResponse);
            this.shipmentDialog = false;
            this.$swal.fire({
              type: "success",
              title: "Success",
              text: "Shipment has been recorded!"
            });
          } catch (error) {
            this.$swal.fire({
              type: "error",
              title: "Failed",
              text: `Shipment creation has failed due to: ${error}`
            });
          }
        } else {
          //get shipment details from component, then pass the details to vuex that inserts to database
          if (this.itemsToShip.length < 1) {
            this.$swal.fire({
              type: "info",
              title: "Items to Ship",
              text: "Please select an item and indicate how many items to ship."
            });
            return;
          }
          try {
            this.shipmentDetails = {
              stockOrder: {
                stockOrderReference: this.item.stockOrderReference,
                stockOrderId: this.item.id
              },
              userDetails: {
                firstName: this.item.user.firstName,
                lastName: this.item.user.lastName,
                middleInitial: this.item.user.middleInitial,
                email: this.item.user.email,
                contact: this.item.user.contact,
                userId: this.item.user.id,
                address: this.item.user.address
              },
              dateSubmitted: Date.now(),
              itemsToShip: this.itemsToShip,
              type: "Partial Shipment",
              status: "Pending"
            };
            //call vuex and pass this.shipmentDetails
            const response = await this.$store.dispatch(
              "shipment/SubmitShipment",
              this.shipmentDetails
            );
            //after saving the Shipment Details, Update the Stock Order Values and Status
            const remainingStockOrderItems = this.item.items.map(item => {
              const updatedIndex = this.itemsToShip.findIndex(
                shippedItem => shippedItem.productId === item.productId
              );
              if (updatedIndex === -1) {
                const updatedStockOrder = {
                  attributes: item.attributes,
                  price: item.price,
                  productId: item.productId,
                  qty: item.qty,
                  unique: item.unique,
                  resellerPrice: item.resellerPrice,
                  shippedQty: item.shippedQty
                };
                return updatedStockOrder;
              } else {
                const shippedQty = this.itemsToShip[updatedIndex].qtyToShip;
                const updatedStockOrder = {
                  attributes: item.attributes,
                  price: item.price,
                  productId: item.productId,
                  qty: item.qty,
                  unique: item.unique,
                  resellerPrice: item.resellerPrice,
                  shippedQty: item.shippedQty + shippedQty
                };
                return updatedStockOrder;
              }
            });

            //check if there will be succeeding deliveries
            const hasSucceedingDeliveries = Object.keys(
              remainingStockOrderItems
            ).reduce(function(previous, key) {
              return (
                previous +
                (remainingStockOrderItems[key].qty -
                  remainingStockOrderItems[key].shippedQty)
              );
            }, 0);

            //console.log(`hasSucceedingDeliveries ${hasSucceedingDeliveries}`);
            if (hasSucceedingDeliveries < 1) {
              this.item.statusTimeline.push({
                status: "shipped",
                date: Date.now()
              });
              const stockOrderUpdatedData = {
                status: "shipped",
                items: remainingStockOrderItems,
                statusTimeline: this.item.statusTimeline,
                id: this.item.id
              };

              const stockOrderUpdateResponse = await this.$store.dispatch(
                "stock_orders/UPDATE_STOCK_ORDER_DETAILS",
                stockOrderUpdatedData
              );

              this.shipmentDialog = false;
              this.$swal.fire({
                type: "success",
                title: "Success",
                text: "Shipment has been recorded!"
              });
            } else {
              this.item.statusTimeline.push({
                status: "partially shipped",
                date: Date.now()
              });
              const stockOrderUpdatedData = {
                status: "partially shipped",
                items: remainingStockOrderItems,
                statusTimeline: this.item.statusTimeline,
                id: this.item.id
              };

              const stockOrderUpdateResponse = await this.$store.dispatch(
                "stock_orders/UPDATE_STOCK_ORDER_DETAILS",
                stockOrderUpdatedData
              );

              this.shipmentDialog = false;
              this.$swal.fire({
                type: "success",
                title: "Success",
                text: "Partial shipment has been recorded!"
              });
            }
          } catch (error) {
            this.$swal.fire({
              type: "error",
              title: "Failed",
              text: `Partial shipment creation has failed due to: ${error}`
            });
          }
        }
      }
    }
  },
  mixins: [mixins],
  computed: {
    userPlaceholder() {
      return userPlaceholder;
    }
  },
  components: {
    AccountData,
    Toast,
    StockOrderItems,
    ShipmentDetails,
    PartialShipment
  },
  watch: {
    selectedStatus(val) {
      this.updateStatus(val.toLowerCase());
    }
  }
};
</script>
</template>
