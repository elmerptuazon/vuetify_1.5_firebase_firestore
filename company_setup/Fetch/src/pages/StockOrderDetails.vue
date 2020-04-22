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
        <v-layout align-top justify-center row wrap>
          <v-flex xs12 s12 md5 lg5 xl5>
            <v-container fluid
              ><v-card>
                <v-card-title>
                  <v-list class="pa-0">
                    <v-list-tile avatar>
                      <v-list-tile-avatar>
                        <v-img
                          v-if="stockOrder.user.downloadURL"
                          :src="stockOrder.user.downloadURL"
                        ></v-img>
                        <v-img v-else :src="userPlaceholder"></v-img>
                      </v-list-tile-avatar>

                      <v-list-tile-content>
                        <v-list-tile-title>
                          {{ stockOrder.user.firstName }}
                          {{ stockOrder.user.middleInitial || "" }}
                          {{ stockOrder.user.lastName }} -
                          {{ stockOrder.user.agentId }}</v-list-tile-title
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
                          stockOrder.stockOrderReference
                        }}</v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile
                      ><v-list-tile-content>
                        <v-list-tile-sub-title>Address</v-list-tile-sub-title>
                        <v-list-tile-title
                          >{{ stockOrder.user.address.house }}
                          {{ stockOrder.user.address.streetName }},
                          {{ stockOrder.user.address.barangay }},
                          {{ stockOrder.user.address.citymun }},
                          {{
                            stockOrder.user.address.province
                          }}</v-list-tile-title
                        >
                      </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile
                      ><v-list-tile-content>
                        <v-list-tile-sub-title
                          >Order Date</v-list-tile-sub-title
                        >
                        <v-list-tile-title>{{
                          stockOrder.submittedAt | momentize("DD-MMM-YYYY")
                        }}</v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile
                      ><v-list-tile-content>
                        <v-list-tile-sub-title>Status</v-list-tile-sub-title>
                        <v-list-tile-title>
                          <span class="primary--text">{{
                            stockOrder.status | uppercase
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
            <v-container fluid>
              <v-card v-if="stockOrder.hasOwnProperty('paymentDetails')">
                <v-card-title>
                  <div class="title">Payment Details</div>
                  <v-spacer></v-spacer>
                  <v-btn
                    v-if="stockOrder.paymentDetails.paymentType != 'CC'"
                    @click="UpdatePayment()"
                    color="primary"
                    :class="[
                      stockOrder.paymentDetails.paymentStatus.toLowerCase() ===
                      'paid'
                        ? 'v-btn--disabled '
                        : ''
                    ]"
                    >Tag as Paid</v-btn
                  >
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-list subheader>
                    <v-list-tile>
                      <v-list-tile-content>
                        <v-list-tile-sub-title
                          >Payment Type</v-list-tile-sub-title
                        >
                        <v-list-tile-title>
                          <span
                            v-if="
                              stockOrder.paymentDetails.paymentType === 'CC'
                            "
                            >Credit Card</span
                          >
                          <span
                            v-else-if="
                              stockOrder.paymentDetails.paymentType === 'COD'
                            "
                            >Cash On Delivery / Upon Pick-Up</span
                          >
                          <span v-else>N/A</span>
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile
                      ><v-list-tile-content>
                        <v-list-tile-sub-title
                          >Total Amount</v-list-tile-sub-title
                        >
                        <v-list-tile-title
                          >{{ stockOrder.paymentDetails.amount }}
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile
                      ><v-list-tile-content>
                        <v-list-tile-sub-title>Status</v-list-tile-sub-title>
                        <v-list-tile-title>
                          <span class="primary--text">{{
                            stockOrder.paymentDetails.paymentStatus | uppercase
                          }}</span>
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                </v-card-text>
              </v-card>
              <div v-else class="body-2">No Payment Details Provided.</div>
            </v-container>
          </v-flex>
          <v-flex xs12 s12 md3 lg3 xl3>
            <v-container fluid>
              <v-card v-if="stockOrder.hasOwnProperty('paymentDetails')">
                <v-card-title>
                  <div class="title">Logistics Details</div>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-list subheader>
                    <v-list-tile>
                      <v-list-tile-content>
                        <v-list-tile-sub-title
                          >Selected Provider</v-list-tile-sub-title
                        >
                        <v-list-tile-title>
                          <span v-if="stockOrder.logisticsDetails">{{
                            stockOrder.logisticsDetails.logisticProvider.toUpperCase()
                          }}</span>
                          <span v-else>N/A</span>
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile
                      ><v-list-tile-content>
                        <v-list-tile-sub-title
                          >Shipping Fee</v-list-tile-sub-title
                        >
                        <v-list-tile-title>
                          <span v-if="stockOrder.logisticsDetails">{{
                            stockOrder.logisticsDetails.shippingFee
                          }}</span>
                          <span v-else>N/A</span>
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile
                      v-if="stockOrder.logisticsDetails.isFreeShipping"
                      ><v-list-tile-content>
                        <v-list-tile-sub-title
                          >Is this Free Shipping?</v-list-tile-sub-title
                        >
                        <v-list-tile-title>
                          <span>YES</span>
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                </v-card-text>
              </v-card>
              <div v-else class="body-2">No Payment Details Provided.</div>
            </v-container>
          </v-flex>
        </v-layout>
        <div class="mb-2"></div>
        <v-card>
          <v-card-title class="title"
            >Order Details
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              @click="updateStatus('processing')"
              :class="[
                stockOrder.status.toLowerCase() != 'pending'
                  ? 'v-btn--disabled '
                  : ''
              ]"
              >Tag for Processing</v-btn
            >
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-btn
              @click="shipmentDialog = true"
              color="primary"
              :class="[
                stockOrder.status.toLowerCase() === 'cancelled'
                  ? 'v-btn--disabled '
                  : stockOrder.status.toLowerCase() === 'shipped'
                  ? 'v-btn--disabled '
                  : stockOrder.status.toLowerCase() === 'partially shipped'
                  ? ''
                  : stockOrder.status.toLowerCase() === 'processing'
                  ? ''
                  : 'v-btn--disabled '
              ]"
              >Ship this Stock Order</v-btn
            >
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-btn
              color="error"
              @click="CancelOrder()"
              :class="[
                stockOrder.status.toLowerCase() === 'cancelled'
                  ? 'v-btn--disabled '
                  : ''
              ]"
              >Cancel Order</v-btn
            >
          </v-card-title>
          <v-divider></v-divider>
          <StockOrderItems :items="stockOrder.items" :loading="loading" />
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
      <ShipmentDetails 
        ref="shipmentDetails" 
        :stockOrderId="stockOrder.id" 
        :logisticProvider="stockOrder.logisticsDetails.logisticProvider"
      />
    </v-card>

    <v-dialog v-model="shipmentDialog" max-width="900" persistent>
      <v-card>
        <v-container grid-list-md>
          <v-card-title class="title">
            Create Shipment
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-layout wrap>
              <v-flex xs6>
                <v-radio-group v-model="shipmentType" row>
                  <v-radio label="Full Shipment" value="Full"></v-radio>
                  <v-radio label="Partial Shipment" value="Partial"></v-radio>
                  <PartialShipment
                    v-if="shipmentType == 'Partial'"
                    :items="stockOrder.items"
                    :loading="loading"
                    :completed="completed"
                    @itemsToShip="SetItemsToShip"
                  />
                </v-radio-group>
              </v-flex>
              <v-flex xs3>
                <v-menu
                  lazy
                  :close-on-content-click="false"
                  v-model="menu"
                  transition="scale-transition"
                  offset-y
                  full-width
                  :nudge-right="40"
                  max-width="290px"
                  min-width="290px"
                >
                  <v-text-field
                    slot="activator"
                    label="Pick-up Date"
                    v-model="pickupDate"
                    prepend-icon="event"
                    readonly
                  ></v-text-field>
                  <v-date-picker
                    v-model="pickupDate"
                    @input="menu = false"
                    no-title
                  ></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex xs3
                v-if="stockOrder.logisticsDetails.logisticProvider !== 'pick-up'"
              >
                <v-menu
                  ref="menu2"
                  v-model="menu2"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  :return-value.sync="time"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="pickupTime"
                      label="Pick Up Time"
                      prepend-icon="access_time"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                    v-if="menu2"
                    v-model="pickupTime"
                    full-width
                  >
                    <v-spacer></v-spacer>
                    <v-btn color="black" flat @click="menu2 = false">CANCEL</v-btn>
                    <v-btn color="primary" depressed @click="$refs.menu2.save(time)">OK</v-btn>
                  </v-time-picker>
                </v-menu>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn 
              color="primary" dark
              :loading="submitLoading" 
              @click="SubmitShipment"
            >
              Submit Shipment
            </v-btn>
            <v-btn @click="closeShipmentDialog">
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
import { FB } from "@/config/firebase";
import userPlaceholder from "@/assets/placeholder.png";
import AccountData from "@/components/AccountData";
import Toast from "@/components/Toast";
import StockOrderItems from "@/components/StockOrderItems";
import ShipmentDetails from "@/components/ShipmentDetails";
import PartialShipment from "@/components/PartialShipment";
import { mapState } from "vuex";
import moment from "moment";

export default {
  data: () => ({
    loading: false,
    item: {},
    itemsToShip: [],
    shipmentDialog: false,
    shipmentType: "Full",
    shipmentDetails: null,
    partialShipment: false,
    pickupDate: null,
    pickupTime: null,
    menu: false,
    menu2: false,
    time: '',
    submitLoading: false,

    //tells the partialShipment component if the previously created
    //partial shipment list has been submitted already
    completed: false
  }),
  async created() {
    this.loading = true;
    try {
      const id = this.$route.params;

      if (!id) {
        this.$router.push({ name: "StockOrders" });
      }
    } catch (error) {
      this.$refs.toast.show("error", "An error occurred");
      console.log(error);
    }
    this.loading = false;
  },
  methods: {
    closeShipmentDialog() {
      this.shipmentDialog = false;
      this.completed = true;
      //clears the partial shipment list upon closing the shipment dialog

      this.pickupDate = null;
      this.pickupTime = null;
      this.shipmentType = 'Full';
    },
    SetItemsToShip(items) {
      this.itemsToShip = items.map(item => {
        const itemToShip = {
          attributes: item.attributes,
          qtyToShip: item.qtyToShip,
          productName: item.name,
          productId: item.productId,
          price: item.price,
          qtyToShipPriceTotal: item.price * item.qtyToShip
        };
        return itemToShip;
      });

      this.completed = false;
      //completed variable has to be false since the partial shipment list
      //is not yet submitted

      console.log(this.itemsToShip);
    },
    async updateStatus(status) {
      try {
        let statusTimeline = this.stockOrder.statusTimeline;
        if (this.stockOrder.statusTimeline) {
          statusTimeline.push({
            status: status,
            date: Date.now()
          });
        } else {
          statusTimeline = [{ status: status, date: Date.now() }];
        }

        await this.$store.dispatch("stock_orders/UPDATE_STATUS", {
          status: status,
          statusTimeline: statusTimeline,
          id: this.$route.params.id
        });

        //this.stockOrder.status = status;
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
      if (!this.pickupDate) {
        this.$swal.fire({
          title: "Missing Pick-up Date",
          text: "Please select a pick-up date!",
          type: "warning"
        });
        return;
      }

      if (!this.pickupTime && this.stockOrder.logisticsDetails.logisticProvider !== 'pick-up') {
        this.$swal.fire({
          title: "Missing Pick-Up Time",
          text: "Please select a pick-up time!",
          type: "warning"
        });
        return;
      }

      const response = await this.$swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Submit it!"
      });

      this.submitLoading = true;

      if (response.value) {
        if (this.shipmentType === "Full") {
          //pass shipment details to vuex that inserts to database
          try {
            const itemsToShip = this.stockOrder.items.map(item => {
              //console.log(item);
              const itemToShip = {
                attributes: item.attributes,
                qtyToShip: item.qty - item.shippedQty,
                productName: item.name,
                productId: item.productId,
                price: item.resellerPrice,
                qtyToShipPriceTotal:
                  item.resellerPrice * (item.qty - item.shippedQty)
              };
              return itemToShip;
            });


            this.shipmentDetails = {
              stockOrder: {
                stockOrderReference: this.stockOrder.stockOrderReference,
                stockOrderId: this.stockOrder.id,
                dateSubmitted: this.stockOrder.submittedAt
              },
              userDetails: {
                firstName: this.stockOrder.user.firstName,
                lastName: this.stockOrder.user.lastName,
                middleInitial: this.stockOrder.user.middleInitial,
                email: this.stockOrder.user.email,
                contact: this.stockOrder.user.contact,
                userId: this.stockOrder.user.id,
                address: this.stockOrder.user.address,
                agentId: this.stockOrder.user.agentId
              },
              dateSubmitted: Date.now(),
              itemsToShip: itemsToShip,
              type: "Full Shipment",
              status: "Pending",
              pickupDate: this.pickupDate,
            };

            //if full shipment will be done through lalamove
            let lalamoveOrderDetails;
            if(this.stockOrder.logisticsDetails.logisticProvider === 'lalamove') {
              let quotationBody = this.stockOrder.logisticsDetails.quotationBody;
              quotationBody.scheduleAt = new Date(`${this.pickupDate} ${this.pickupTime}`).toISOString();
              quotationBody.deliveries[0].remarks = `STOCK ORDER: ${this.stockOrder.stockOrderReference}`
              
              lalamoveOrderDetails = await this.$store.dispatch('lalamove/placeOrder', quotationBody);

              this.shipmentDetails.lalamoveOrderDetails = lalamoveOrderDetails;
              this.shipmentDetails.pickupDate = new Date(`${this.pickupDate} ${this.pickupTime}`).toISOString();

              this.$refs.shipmentDetails.refreshShipmentStatus(this.shipmentDetails);
            }
            
            //call vuex and pass this.shipmentDetails
            const response = await this.$store.dispatch(
              "shipment/SubmitShipment",
              this.shipmentDetails
            );

            //update the lalamove order status of the created shipment
            if(this.stockOrder.logisticsDetails.logisticProvider === 'lalamove') {
              this.shipmentDetails.id = response.id;
              this.$refs.shipmentDetails.refreshShipmentStatus(this.shipmentDetails);
            }

            //after saving the Shipment Details, Update the Stock Order Values and Status
            //console.log(response);
              
            const remainingStockOrderItems = this.stockOrder.items.map(item => {
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
            let statusTimeline = this.stockOrder.statusTimeline;

            statusTimeline.push({
              status: "shipped",
              date: Date.now()
            });

            //create shipmentsToReceive if this stock order is for pickup
            let shipmentIncrement = 0;
            if(this.stockOrder.logisticsDetails.logisticProvider === 'pick-up') {
              shipmentIncrement = FB.firestore.FieldValue.increment(1);  
            }
            
            const stockOrderUpdatedData = {
              status: "shipped",
              items: remainingStockOrderItems,
              statusTimeline: statusTimeline,
              shipmentsToReceive: shipmentIncrement
            };

            const stockOrderUpdateResponse = await this.$store.dispatch(
              "stock_orders/UPDATE_STOCK_ORDER_DETAILS",
              {
                updateObject: stockOrderUpdatedData,
                referenceID: this.stockOrder.id
              }
            );

            //console.log(stockOrderUpdateResponse);
            this.shipmentDialog = false;
            this.$swal.fire({
              type: "success",
              title: "Success",
              text: "Shipment has been recorded!"
            });
          } catch (error) {
            let errorMessage = '';
            switch(error.response.data.message) {
              case("ERR_DELIVERY_MISMATCH"): {
                errorMessage = "There's an error in delivery matching.";
                break;
              }

              case("ERR_INSUFFICIENT_STOPS"): {
                errorMessage = "Insufficient stops on delivery.";
                break;
              }

              case("ERR_TOO_MANY_STOPS"): {
                errorMessage = "There are too many delivery stops.";
                break;
              }

              case("ERR_INVALID_PAYMENT_METHOD"): {
                errorMessage = "Invalid payment method.";
                break;
              }

              case("ERR_INVALID_PHONE_NUMBER"): {
                errorMessage = "Invalid phone number.";
                break;
              }

              case("ERR_INVALID_SCHEDULE_TIME"): {
                errorMessage = "Invalid pick-up date and time.";
                break;
              }

              case("ERR_INVALID_SERVICE_TYPE"): {
                errorMessage = "Invalid service type.";
                break;
              }

              case("ERR_INVALID_SPECIAL_REQUEST"): {
                errorMessage = "Invalid special request";
                break;
              }

              case("ERR_OUT_OF_SERVICE_AREA"): {
                errorMessage = "Lalamove is not available on the recepient's area.";
                break;
              }

              default: {
                errorMessage = error.data.message || error.response.data.message;
                break;
              }
            }

            this.$swal.fire({
              type: "error",
              title: "Error",
              text: `${errorMessage} Please try again.`
            });

          }
        } else {
          //this is the logic for creating partial shipment
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
                stockOrderReference: this.stockOrder.stockOrderReference,
                stockOrderId: this.stockOrder.id,
                dateSubmitted: this.stockOrder.submittedAt
              },
              userDetails: {
                firstName: this.stockOrder.user.firstName,
                lastName: this.stockOrder.user.lastName,
                middleInitial: this.stockOrder.user.middleInitial,
                email: this.stockOrder.user.email,
                contact: this.stockOrder.user.contact,
                userId: this.stockOrder.user.id,
                address: this.stockOrder.user.address,
                agentId: this.stockOrder.user.agentId
              },
              dateSubmitted: Date.now(),
              itemsToShip: this.itemsToShip,
              type: "Partial Shipment",
              status: "Pending",
              pickupDate: this.pickupDate            
            };

            let lalamoveOrderDetails;
            if(this.stockOrder.logisticsDetails.logisticProvider === 'lalamove') {
              let quotationBody = this.stockOrder.logisticsDetails.quotationBody;
              quotationBody.scheduleAt = new Date(`${this.pickupDate} ${this.pickupTime}`).toISOString();
              quotationBody.deliveries[0].remarks = `STOCK ORDER: ${this.stockOrder.stockOrderReference}`
              
              lalamoveOrderDetails = await this.$store.dispatch('lalamove/placeOrder', quotationBody);

              this.shipmentDetails.lalamoveOrderDetails = lalamoveOrderDetails;
              this.shipmentDetails.pickupDate = new Date(`${this.pickupDate} ${this.pickupTime}`).toISOString();
              
            }
            //call vuex and pass this.shipmentDetails
            const response = await this.$store.dispatch(
              "shipment/SubmitShipment",
              this.shipmentDetails
            );

            //update the lalamove status of the created shipment
            if(this.stockOrder.logisticsDetails.logisticProvider === 'lalamove') {
              this.shipmentDetails.id = response.id;
              this.$refs.shipmentDetails.refreshShipmentStatus(this.shipmentDetails);
            }

            //after saving the Shipment Details, Update the Stock Order Values and Status
            const remainingStockOrderItems = this.stockOrder.items.map(item => {
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
              let statusTimeline = this.stockOrder.statusTimeline;

              statusTimeline.push({
                status: "shipped",
                date: Date.now()
              });

              const stockOrderUpdatedData = {
                status: "shipped",
                items: remainingStockOrderItems,
                statusTimeline: statusTimeline,
              };
              
              //create shipmentsToReceive if this stock order is for pickup
              if(this.stockOrder.logisticsDetails.logisticProvider === 'pick-up') {
                stockOrderUpdatedData.shipmentsToReceive = FB.firestore.FieldValue.increment(1);  
              }
              
              const stockOrderUpdateResponse = await this.$store.dispatch(
                "stock_orders/UPDATE_STOCK_ORDER_DETAILS",
                {
                  updateObject: stockOrderUpdatedData,
                  referenceID: this.stockOrder.id
                }
              );

              this.shipmentDialog = false;
              this.$swal.fire({
                type: "success",
                title: "Success",
                text: "Shipment has been recorded!"
              });
            } else {
              let statusTimeline = this.stockOrder.statusTimeline;

              statusTimeline.push({
                status: "partially shipped",
                date: Date.now()
              });

              const stockOrderUpdatedData = {
                status: "partially shipped",
                items: remainingStockOrderItems,
                statusTimeline: statusTimeline,
              };

              //create shipmentsToReceive if this stock order is for pickup
              if(this.stockOrder.logisticsDetails.logisticProvider === 'pick-up') {
                stockOrderUpdatedData.shipmentsToReceive = FB.firestore.FieldValue.increment(1);  
              }

              const stockOrderUpdateResponse = await this.$store.dispatch(
                "stock_orders/UPDATE_STOCK_ORDER_DETAILS",
                {
                  updateObject: stockOrderUpdatedData,
                  referenceID: this.stockOrder.id
                }
              );

              this.shipmentDialog = false;
              this.$swal.fire({
                type: "success",
                title: "Success",
                text: "Partial shipment has been recorded!"
              });
              
              this.pickupDate = null;
              this.pickupTime = null;

              this.completed = true;
              //"completed" variable has to be true since the created partial shipment
              //has been recorded already
              //this will ensure that the partialShipment component wont display the previously created partial shipment list
            }
          } catch (error) {
            console.log(error);
            let errorMessage = '';
            switch(error.response.data.message) {
              case("ERR_DELIVERY_MISMATCH"): {
                errorMessage = "There's an error in delivery matching.";
                break;
              }

              case("ERR_INSUFFICIENT_STOPS"): {
                errorMessage = "Insufficient stops on delivery.";
                break;
              }

              case("ERR_TOO_MANY_STOPS"): {
                errorMessage = "There are too many delivery stops.";
                break;
              }

              case("ERR_INVALID_PAYMENT_METHOD"): {
                errorMessage = "Invalid payment method.";
                break;
              }

              case("ERR_INVALID_PHONE_NUMBER"): {
                errorMessage = "Invalid phone number.";
                break;
              }

              case("ERR_INVALID_SCHEDULE_TIME"): {
                errorMessage = "Invalid pick-up date and time.";
                break;
              }

              case("ERR_INVALID_SERVICE_TYPE"): {
                errorMessage = "Invalid service type.";
                break;
              }

              case("ERR_INVALID_SPECIAL_REQUEST"): {
                errorMessage = "Invalid special request";
                break;
              }

              case("ERR_OUT_OF_SERVICE_AREA"): {
                errorMessage = "Lalamove is not available on the recepient's area.";
                break;
              }

              default: {
                errorMessage = error.response.data;
                break;
              }
            }

            this.$swal.fire({
              type: "error",
              title: "Failed",
              text: `Partial shipment creation has failed due to: ${errorMessage}`
            });

            this.pickupDate = null;
            this.pickupTime = null;

            this.completed = true;
            //"completed" variable has to be true since the created partial shipment
            //has been recorded already
          }
        }
      }
      
      this.submitLoading = false;
      this.shipmentDialog = false;
    },
    async CancelOrder() {
      const response = await this.$swal.fire({
        title: "Are you sure?",
        text: "Are you sure you want to cancel the order?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Cancel it!"
      });
      if (response.value) {
        this.updateStatus("cancelled");
      }
    },
    async UpdatePayment() {
      const response = await this.$swal.fire({
        title: "Are you sure?",
        text: "Are you sure you want to tag the payment of this order as PAID?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!"
      });
      if (response.value) {
        //call store for updating payment
        try {
          let updateObj = {
            id: this.$route.params.id,
            paymentDetails: this.stockOrder.paymentDetails
          };

          updateObj.paymentDetails.paymentStatus = "Paid";
          updateObj.paymentDetails.paymentDate = Date.now();

          await this.$store.dispatch(
            "stock_orders/UPDATE_STOCK_ORDER_PAYMENT_DETAILS",
            updateObj
          );

          this.$swal.fire({
            type: "success",
            title: "Success",
            text: "Payment status has been updated!"
          });
        } catch (e) {
          this.$swal.fire({
            type: "error",
            title: "Sorry",
            text: `An Error has occured!: ${e}`
          });
        }
      }
    }
  },
  mixins: [mixins],
  computed: {
    userPlaceholder() {
      return userPlaceholder;
    },
    ...mapState("stock_orders", {
      stockOrder: state => state.stockOrder
    })
  },
  components: {
    AccountData,
    Toast,
    StockOrderItems,
    ShipmentDetails,
    PartialShipment
  }
};
</script>
</template>
