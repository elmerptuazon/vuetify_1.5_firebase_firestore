<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-flex
        xs12
        v-for="shipment in shipmentList"
        :key="shipment.trackingNumber"
      >
        <v-card
          class="mt-2"
          color="white"
          :class="[
            shipment.status.toLowerCase() === 'cancelled'
              ? 'grey lighten-1'
              : '',
            shipment.status.toLowerCase() === 'completed'
              ? 'success lighten-4' 
              : '',
            shipment.status.toLowerCase() === 'received'
              ? 'success lighten-4' 
              : '',
            shipment.status.toLowerCase() === 'rejected'
              ? 'warning lighten-4'
              : ''
          ]"
        >
          <v-card-title class="title">
            Parcel ID: {{ shipment.trackingNumber }}
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              v-show="shipment.status.toLowerCase() === 'pending' ||
                shipment.status.toLowerCase() === 'completed'
              "
              @click="UpdateShipmentStatus(shipment)"
              >Tag as Received</v-btn
            >
            <v-divider
              class="mx-3"
              inset
              vertical
              v-show="shipment.status.toLowerCase() === 'pending' ||
                shipment.status.toLowerCase() === 'completed'
              "
            ></v-divider>
            <v-btn
              color="error"
              v-show="shipment.status.toLowerCase() === 'pending' ||
                shipment.status.toLowerCase() === 'assigning_driver' ||
                shipment.status.toLowerCase() === 'on_going'
              "
              :disabled="cancelBtn"
              :loading="cancelBtn"
              @click="cancelShipment(shipment)"
              >Cancel Shipment</v-btn
            >
            <v-divider
              class="mx-3"
              inset
              vertical
              v-show="shipment.status.toLowerCase() === 'pending' ||
                shipment.status.toLowerCase() === 'assigning_driver' ||
                shipment.status.toLowerCase() === 'on_going'
              "
            ></v-divider>
            <v-btn color="primary" @click="printShipmentDetails(shipment)"
              >Print Shipment Details</v-btn
            >
          </v-card-title>

          <v-card-text>
            <v-layout align-center justify-space-around row wrap>
              <v-flex xs12 md5>
                <v-container fluid
                  ><v-card>
                    <v-card-actions class="mb-0 pb-0">
                      <v-spacer> </v-spacer>
                     <v-btn
                        v-if="shipment.status.toLowerCase() === 'assigning_driver' ||
                          shipment.status.toLowerCase() === 'pending'
                        "
                        small
                        icon
                      >
                        <v-icon @click="showShipmentFields(shipment)"
                          >edit</v-icon
                        >
                      </v-btn>
                    </v-card-actions>
                    <v-card-text class="mt-0 pt-0">
                      <v-list subheader>
                        <v-list-tile
                          ><v-list-tile-content>
                            <v-list-tile-sub-title
                              >Logistic's Shipment Tracking Number
                            </v-list-tile-sub-title>
                            <v-list-tile-title
                              >{{ shipment.logisticSTN }}
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile
                          ><v-list-tile-content>
                            <v-list-tile-sub-title
                              >Shipment Type</v-list-tile-sub-title
                            >
                            <v-list-tile-title
                              >{{ shipment.type }}
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile
                          ><v-list-tile-content>
                            <v-list-tile-sub-title
                              >Shipment Status</v-list-tile-sub-title
                            >
                            <v-list-tile-title
                              :class="[
                                shipment.status.toLowerCase() === 'cancelled' || shipment.status.toLowerCase() === 'rejected'
                                  ? 'red--text font-weight-bold'
                                  : ''
                              ]"
                              >{{ shipment.status }} 
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile v-if="shipment.shipmentDate"
                          ><v-list-tile-content>
                            <v-list-tile-sub-title
                              >Shipment Delivery Date
                            </v-list-tile-sub-title>
                            <v-list-tile-title>
                              {{
                                shipment.shipmentDate | momentize("DD-MMM-YYYY")
                              }}
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile
                          ><v-list-tile-content>
                            <v-list-tile-sub-title
                              >Pick-up Date
                            </v-list-tile-sub-title>
                            <v-list-tile-title>
                              {{
                                shipment.pickupDate | momentize("DD-MMM-YYYY | hh:mm a")
                              }}
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>
                      <v-layout align-center align-start mt-2 wrap
                        v-if="shipment.lalamoveOrderDetails"
                      >
                        <v-flex xs12 v-if="shipment.status.toLowerCase() !== 'received'">
                          <v-btn
                          
                            color="primary"
                            depressed block
                            :loading="statusBtn"
                            :disabled="statusBtn"
                            @click="refreshShipmentStatus(shipment)"
                          >REFRESH SHIPMENT STATUS</v-btn>
                        </v-flex>
                        <v-flex xs12 v-if="shipment.status.toLowerCase() !== 'received'">
                          <div class="primary--text caption font-italic">
                            *Real-time updates for a Lalamove Delivery order is not supported yet.
                            Please click the button above to frequently see updates on your Lalamove Delivery order.
                          </div>
                        </v-flex>
                      </v-layout>
                      <v-layout align-center align-start mt-2 wrap
                        v-if="shipment.lalamoveOrderDetails"
                      >
                        <v-flex xs12>
                          <v-btn
                            color="black"
                            outline block
                            @click="openRebookDialog(shipment)"
                            v-show="shipment.status.toLowerCase() === 'expired' ||
                              shipment.status.toLowerCase() === 'cancelled' ||
                              shipment.status.toLowerCase() === 'rejected'
                            "
                          > Re-Book this Shipment</v-btn>
                        </v-flex>
                      </v-layout>
                    </v-card-text>
                  </v-card></v-container
                >
              </v-flex>
              <v-flex xs12 md7>
                <v-container fluid
                  ><v-card>
                    <v-card-text>
                      <v-list subheader>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-sub-title
                              >Stock Order Reference
                              Number</v-list-tile-sub-title
                            >
                            <v-list-tile-title>{{
                              shipment.stockOrder.stockOrderReference
                            }}</v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-sub-title
                              >Customer Name</v-list-tile-sub-title
                            >
                            <v-list-tile-title>
                              {{ shipment.userDetails.firstName }}
                              {{ shipment.userDetails.middleInitial || "" }}
                              {{
                                shipment.userDetails.lastName
                              }}</v-list-tile-title
                            >
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile
                          ><v-list-tile-content>
                            <v-list-tile-sub-title
                              >Address</v-list-tile-sub-title
                            >
                            <v-list-tile-title
                              >{{ shipment.userDetails.address.house }}
                              {{ shipment.userDetails.address.streetName }},
                              {{ shipment.userDetails.address.barangay }},
                              {{ shipment.userDetails.address.citymun }},
                              {{ shipment.userDetails.address.province }},
                              {{
                                shipment.userDetails.address.zipCode
                              }}</v-list-tile-title
                            >
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>
                    </v-card-text>
                  </v-card></v-container
                >
              </v-flex>

              <v-flex xs12>
                <v-data-table
                  hide-actions
                  :headers="headers"
                  :items="shipment.itemsToShip"
                  class="elevation-1"
                >
                  <template slot="items" slot-scope="props">
                    <td class="text-xs-left">{{ props.item.productName }}</td>
                    <td class="text-xs-center">{{ props.item.qtyToShip }}</td>
                  </template>
                </v-data-table>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-dialog v-model="shipmentDialog" max-width="600px">
      <v-card>
        <v-card-title>Shipment Details </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedShipment.logisticSTN"
            label="Logistic's Shipment Tracking Number"
            clearable
          >
          </v-text-field>
          <v-menu
            v-if="!selectedShipment.logisticsProvider"
            lazy
            :close-on-content-click="false"
            v-model="dateMenu"
            transition="scale-transition"
            offset-y
            full-width
            :nudge-right="40"
            max-width="290px"
            min-width="290px"
          >
            <v-text-field
              slot="activator"
              label="Shipment Date"
              v-model="selectedShipment.shipmentDate"
              prepend-icon="event"
              readonly
            ></v-text-field>
            <v-date-picker
              v-model="selectedShipment.shipmentDate"
              @input="dateMenu = false"
              no-title
            ></v-date-picker>
          </v-menu>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="shipmentDialog = false" flat
            >Close</v-btn
          >
          <v-btn
            color="blue darken-1"
            flat
            :loading="btnloading"
            @click="UpdateShipmentDetails"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="rebookDialog" max-width="600px">
      <v-card>
        <v-card-title>
          Re-Book Shipment: <span class="font-weight-bold">{{ rebookShipment.trackingNumber }}</span>
        </v-card-title>
        <v-card-text>
          <v-menu
            lazy
            :close-on-content-click="false"
            v-model="dateMenu2"
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
              placeholder="Select a new pick-up date"
              v-model="rebookShipment.pickupDate"
              prepend-icon="event"
              readonly
            ></v-text-field>
            <v-date-picker
              v-model="rebookShipment.pickupDate"
              @input="dateMenu2 = false"
              no-title
            ></v-date-picker>
          </v-menu>
          <v-spacer/>
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
                v-model="rebookShipment.pickupTime"
                label="Pick-up Time"
                placeholder="Select a new pick-up time"
                prepend-icon="access_time"
                readonly
                v-on="on"
              ></v-text-field>
            </template>
            <v-time-picker
              v-if="menu2"
              v-model="rebookShipment.pickupTime"
              full-width
            >
              <v-spacer></v-spacer>
              <v-btn color="black" flat @click="menu2 = false">CANCEL</v-btn>
              <v-btn color="primary" depressed @click="$refs.menu2.save(time)">OK</v-btn>
            </v-time-picker>
          </v-menu>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="rebookDialog = false" flat
            >Close</v-btn
          >
          <v-btn
            color="blue darken-1"
            flat
            :loading="rebookBtn"
            @click="rebookDelivery"
            >Re-Book Shipment</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import mixins from "@/mixins";
import { mapState } from "vuex";
import { FB } from "@/config/firebase";
import moment from "moment";
export default {
  props: ["stockOrderId", "stockOrder", "logisticProvider"],
  data: () => ({
    selectedItem: {},
    headers: [
      {
        text: "Product Name",
        align: "center",
        sortable: true,
        value: "productName"
      },
      {
        text: "Qty to Ship",
        value: "qtyToShip",
        align: "center"
      }
    ],
    btnloading: false,
    //showShipmentFields: false,
    shipmentDialog: false,
    rebookDialog: false,
    rebookShipment: {},
    menu2: false,
    time: null,
    dateMenu: false,
    dateMenu2: false,
    selectedShipment: {
      logisticSTN: null,
      shipmentDate: null
    },
    statusBtn: false,
    rebookBtn: false,
    cancelBtn: false,
  }),
  computed: {
    shipmentList() {
      const shipments = this.$store.getters['shipment/GET_SHIPMENTS'];
      const shipmentsInStockOrder = shipments.filter((shipment) => {
        return shipment.stockOrder.stockOrderId === this.stockOrderId;
      });

      return shipmentsInStockOrder;
    },
  },
  // created() {
  //   //run vuex to get corresponding shipment details for a stockOrder via the stockOrderId
  //   this.$store.dispatch("shipment/GetShipments", this.stockOrderId);
  // },
  methods: {
    async refreshShipmentStatus(shipment) {
      this.statusBtn = true;
      console.log('Refresh Shipment Status', shipment);

      //retrieve any new update on the shipment details
      let prevShipmentState = await this.$store.dispatch('shipment/GetSingleShipment', shipment.id);
      const prevStatus = prevShipmentState.status.toUpperCase();

      if(prevStatus === 'RECEIVED') {
        shipment.status = prevStatus;
        return;
      }

      let response;
      try {
        response = await this.$store.dispatch("lalamove/getOrderStatus", {
          customerOrderId: shipment.lalamoveOrderDetails.customerOrderId,
          orderRef: shipment.lalamoveOrderDetails.orderRef
        });
      }
      catch(error) {
        console.log(error);
        this.statusBtn = false;
      }
      
      console.log('SHIPMENT DETAILS STATUS:', response);
      shipment.status = response.status;
      shipment.price = response.price.amount;

      try {
        //update shipment status in DB when there is a new lalamove status
        if(prevStatus !== response.status.toLowerCase()) {
          await this.$store.dispatch("shipment/UpdateShipment", {
            id: shipment.id,
            updatedDetails: {
              status: shipment.status,
              price: shipment.price
            }
          });

          // //if the new lalamove status is picked_up, then increment the shipmentsToReceive counter in DB
          // if(response.status.toLowerCase() === 'picked_up') {
          //   const shipmentIncrement =  FB.firestore.FieldValue.increment(1);
          //   await this.$store.dispatch("stock_orders/UPDATE_STOCK_ORDER_DETAILS",
          //     {
          //       updateObject: { shipmentsToReceive: shipmentIncrement },
          //       referenceID: this.stockOrderId
          //     }
          //   ); 
          // }
        }
      }
      catch(error) {
        console.log(error);
        this.statusBtn = false;
      }
        
      this.statusBtn = false;
    },
    async openRebookDialog(shipment) {
      this.rebookShipment = Object.assign({}, shipment);
      this.rebookShipment.pickupDate = null;
      this.rebookDialog = true;
    },
    async rebookDelivery() {
      this.rebookBtn = true;

      let newPickupDate = new Date(`${this.rebookShipment.pickupDate} ${this.rebookShipment.pickupTime}`).toISOString();

      let stockOrder;
      try {
        stockOrder = await this.$store.dispatch('stock_orders/GET_STOCK_ORDER', {
          id: this.rebookShipment.stockOrder.stockOrderId
        });
      }
      catch(error) {
        console.log(error);
        this.rebookBtn = false;
        this.rebookDialog = false;

        this.$swal.fire({
          type: "error",
          title: "Error",
          text: "Re-Booking was not successful! Please try again. " + error
        });
      }
      
      let quotationBody = stockOrder.logisticsDetails.quotationBody;
      quotationBody.scheduleAt = newPickupDate;

      try {
        let newLalamoveOrderDetails = await this.$store.dispatch('lalamove/placeOrder', quotationBody); 

        await this.$store.dispatch('shipment/UpdateShipment', {
          id: this.rebookShipment.id,
          updatedDetails: {
            lalamoveOrderDetails: newLalamoveOrderDetails,
            status: 'Pending',
            pickupDate: newPickupDate
          }
        });

        this.rebookShipment.lalamoveOrderDetails = newLalamoveOrderDetails;

        this.rebookBtn = false;
        this.rebookDialog = false;
        this.$swal.fire({
          type: "success",
          title: "Success",
          text: "Re-Booking was successful!"
        });

        await this.refreshShipmentStatus(this.rebookShipment);
        delete this.rebookShipment.pickupTime;
        this.rebookShipment = {};
      }
      catch(error) {
        console.log(error);

        this.rebookBtn = false;
        this.rebookDialog = false;
        this.rebookShipment = {};

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

          case("ERR_INSUFFICIENT_CREDIT"): {
            errorMessage = "You have insufficient credit. Please top up your wallet.";
            break;
          }

          default: {
            errorMessage = "Unknown error.";
            break;
          }
        }

        this.$swal.fire({
          type: "error",
          title: "Error",
          text: `${errorMessage} Please try again.`
        });
      }

    },
    async UpdateShipmentStatus(shipment) {
      //updates hipmentstatus here
      console.log(shipment);

      let updateObj = {
        id: shipment.id,
        updatedDetails: {
          status: "Received"
        }
      };

      try {
        await this.$store.dispatch("shipment/UpdateShipment", updateObj);

        // if(this.stockOrder.shipmentsToReceive > 0) {
        //   let stockOrderUpdateObj = {
        //     referenceID: shipment.stockOrder.stockOrderId,
        //     updateObject: {
        //       shipmentsToReceive: FB.firestore.FieldValue.increment(-1)
        //     }
        //   };

        //   await this.$store.dispatch(
        //     "stock_orders/UPDATE_STOCK_ORDER_DETAILS",
        //     stockOrderUpdateObj
        //   );
        // }
        
        this.$swal.fire({
          type: "success",
          title: "Success",
          text: "Shipment status has been updated!"
        });
      } catch (e) {
        this.$swal.fire({
          type: "error",
          title: "Failed",
          text: `Shipment update has failed due to: ${e}`
        });
      }
    },
    async cancelShipment(shipment) {
      //updates hipmentstatus here
      //console.log(shipment);

      let lalamoveCancel = ''; 
      if(shipment.hasOwnProperty('lalamoveOrderDetails')) {
        lalamoveCancel = 'Cancellation is only allowed 5-mins after the order has been accepted by the driver.';
      }

      const response = await this.$swal.fire({
        title: "Are you sure?",
        text: 
        `You won't be able to revert this! \n ${lalamoveCancel}`,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Cancel it!"
      });


      if (response.value) {
        this.cancelBtn = true;

        if(shipment.hasOwnProperty('lalamoveOrderDetails')) {
          try {
            let response = await this.$store.dispatch('lalamove/cancelOrder', {
              customerOrderId: shipment.lalamoveOrderDetails.customerOrderId,
              orderRef: shipment.lalamoveOrderDetails.orderRef
            });

            if(response.isSuccessful) {
              this.$swal.fire({
                type: "success",
                title: "Success",
                text: "Lalamove Delivery cancellation was successful."
              });
            }
          }
          catch(error) {
            this.cancelBtn = false;
            let msg;
            if(error.response.data.message === 'ERR_CANCELLATION_FORBIDDEN') {
              msg = 'You have exceeded the 5-minute cancellation window period.';
            }
            else {
              msg = '';
            }

            this.$swal.fire({
              type: "error",
              title: "Error",
              text: "Lalamove Delivery cancellation was not successful. " + msg
            });
            return;
          }
        }

        let updateObj = {
          id: shipment.id,
          updatedDetails: {
            status: "Cancelled"
          }
        };

        //move this to Vuex or do this kind of updates in a cloud functions
        let stockOrderDataDocument = await FB.firestore()
          .collection("stock_orders")
          .doc(shipment.stockOrder.stockOrderId)
          .get();

        let updatedStockOrderItems = stockOrderDataDocument
          .data()
          .items.map(item => {
            const cancelledItem = shipment.itemsToShip.find(
              shippedItem => shippedItem.productId === item.productId
            );
            if (cancelledItem) {
              item.shippedQty = item.shippedQty - cancelledItem.qtyToShip;
            }
            return item;
          });
        let stockOrderStatus;
        if (
          typeof stockOrderDataDocument.data().statusTimeline[
            stockOrderDataDocument.data().statusTimeline.length - 2
          ] == "undefined"
        ) {
          stockOrderStatus = "pending";
        } else {
          stockOrderStatus = stockOrderDataDocument.data().statusTimeline[
            stockOrderDataDocument.data().statusTimeline.length - 2
          ].status;
        }
        let updatedeStatusTimeline = stockOrderDataDocument.data()
          .statusTimeline;

        updatedeStatusTimeline.push({
          status: stockOrderStatus,
          date: Date.now()
        });
        const shipmentDecrement = FB.firestore.FieldValue.increment(-1);
        let stockOrderUpdateObj = {
          referenceID: shipment.stockOrder.stockOrderId,
          updateObject: {
            shipmentsToReceive: shipmentDecrement,
            items: updatedStockOrderItems,
            status: stockOrderStatus,
            statusTimeline: updatedeStatusTimeline
          }
        };

        //dont decrement shipmentsToReceive if it will be delivered through lalamove
        if(shipment.hasOwnProperty('lalamoveOrderDetails')) {
          delete stockOrderUpdateObj.updateObject.shipmentsToReceive;
        }

        try {
          await this.$store.dispatch("shipment/UpdateShipment", updateObj);
          await this.$store.dispatch(
            "stock_orders/UPDATE_STOCK_ORDER_DETAILS",
            stockOrderUpdateObj
          );
          this.$swal.fire({
            type: "success",
            title: "Success",
            text: "Shipment status has been updated!"
          });
          this.cancelBtn = false;
        } catch (e) {
          this.$swal.fire({
            type: "error",
            title: "Failed",
            text: `Shipment update has failed due to: ${e}`
          });
          this.cancelBtn = false;
        }
      }
    },
    async UpdateShipmentDetails() {
      this.btnloading = true;

      if (!this.selectedShipment.logisticSTN) {
        this.$swal.fire({
          type: "error",
          title: "Missing Logistic's Shipment Tracking Number",
          text: `Please provide the Logistic's Shipment Tracking Number`
        });
        this.btnloading = false;
        return;
      }
      let updateObj = {
        id: this.selectedShipment.id,
        updatedDetails: {
          logisticSTN: this.selectedShipment.logisticSTN,
          shipmentDate:
            new Date(
              moment(this.selectedShipment.shipmentDate).startOf("day")
            ).getTime() || null
        }
      };
      try {
        await this.$store.dispatch("shipment/UpdateShipment", updateObj);
        this.$swal.fire({
          type: "success",
          title: "Success",
          text: "Shipment details has been updated!"
        });
        this.btnloading = false;
        this.shipmentDialog = false;
      } catch (e) {
        this.$swal.fire({
          type: "error",
          title: "Failed",
          text: `Shipment update has failed due to: ${e}`
        });
        this.btnloading = false;
        this.shipmentDialog = false;
      }
    },
    showShipmentFields(shipment) {
      this.shipmentDialog = true;
      //this.selectedShipment.shipmentDate = shipment.shipmentDate;
      this.selectedShipment.logisticSTN = shipment.logisticSTN;
      this.selectedShipment.id = shipment.id;
      if(shipment.lalamoveOrderDetails) {
        this.selectedShipment.logisticsProvider = 'lalamove';
      }
      
      console.log(this.selectedShipment);
    },
    printShipmentDetails(shipment) {
      const date = new Date(shipment.shipmentDate);
      if (date) {
        const month = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sept",
          "Oct",
          "Nov",
          "Dec"
        ];
        shipment.shipmentDate = `${
          month[date.getMonth()]
        } ${date.getDate()} ${date.getFullYear()}`;
      } else {
        shipment.shipmentDate = null;
      }

      //create the html code for the "items to be ship" table
      let itemsToShipHTML =
        "<table><tr><th>Product Name</th><th>Qty to Ship</th></tr>";

      for (let i = 0; i < shipment.itemsToShip.length; i++) {
        const item = shipment.itemsToShip[i];
        itemsToShipHTML += "<tr>";
        itemsToShipHTML +=
          "<td>" +
          item.productName +
          "</td>" +
          "<td>" +
          item.qtyToShip +
          "</td>";
        itemsToShipHTML += "</tr>";
      }

      itemsToShipHTML += "</table>";

      // Open the print window
      const WinPrint = window.open(
        "",
        "",
        "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0"
      );

      WinPrint.document.write(`<!DOCTYPE html>
      <html>
        <head>
         <style>
          
          body {
            margin-left: 30px;
             margin-top: 200px;
          }

          table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
          }

          th, td {
            padding: 10px;
            text-align: left;
          }

          .title {
            font-weight: bold;
          }

          .header {
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 5px;
          }

         </style>
        </head>
       
        <body>
          <div class="header">
            Shipment Details
          </div>

          <table>
            <tr>
              <td class="title">Parcel ID</td>
              <td>${shipment.trackingNumber || ""}</td>
            </tr>
            <tr>
              <td class="title">Customer Name</td>
              <td>${shipment.userDetails.firstName || ""} ${shipment.userDetails
        .middleInitial || ""} ${shipment.userDetails.lastName || ""}</td>
            </tr>
            <tr>
              <td class="title">Stock Order Reference Number</td>
              <td>${shipment.stockOrder.stockOrderReference || ""}</td>
            </tr>
            <tr>
              <td class="title">Address</td>
              <td>${shipment.userDetails.address.house || ""} ${shipment
        .userDetails.address.streetName || ""} ${shipment.userDetails.address
        .barangay || ""} ${shipment.userDetails.address.citymun || ""} ${
        shipment.userDetails.address.province
      }  ${shipment.userDetails.address.zipCode || ""} 
      </td>
            </tr>
             <tr>
              <td class="title">Contact Details</td>
              <td>${shipment.userDetails.contact || ""}</td>
            </tr>
            <tr>
              <td class="title">Shipment Type</td>
              <td>${shipment.type || ""}</td>
            </tr>
           
            <tr>
              <td class="title">Logistic's Shipment Tracking Number</td>
              <td>${shipment.logisticSTN || ""}</td>
            </tr>
          </table>
          
          <br/>

          <div>
            <div class="header">
              Items to Ship
            </div>

            ${itemsToShipHTML}
          </div>
        </body>
      </html>`);

      WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
    }
  },
  mixins: [mixins],
};
</script>