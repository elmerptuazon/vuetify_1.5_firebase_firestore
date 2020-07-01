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
              : ''
          ]"
        >
          <v-card-title class="title">
            Parcel ID: {{ shipment.trackingNumber }}
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              v-show="shipment.status.toLowerCase() === 'pending'"
              @click="UpdateShipmentStatus(shipment)"
              >Tag as Received</v-btn
            >
            <v-divider
              class="mx-3"
              inset
              vertical
              v-show="shipment.status.toLowerCase() === 'pending'"
            ></v-divider>
            <v-btn
              color="error"
              v-show="shipment.status.toLowerCase() === 'pending'"
              @click="cancelShipment(shipment)"
              >Cancel Shipment</v-btn
            >
            <v-divider
              class="mx-3"
              inset
              vertical
              v-show="shipment.status.toLowerCase() === 'pending'"
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
                        v-if="shipment.status.toLowerCase() === 'pending'"
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
                                shipment.status.toLowerCase() === 'cancelled'
                                  ? 'red--text'
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
                                shipment.pickupDate | momentize("DD-MMM-YYYY")
                              }}
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>
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
                    <td class="text-xs-center">
                      <span v-if="props.item.variantName">{{ props.item.variantName }}</span>
                      <span v-else> - </span>
                    </td>
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
  </v-container>
</template>

<script>
import mixins from "@/mixins";
import { mapState } from "vuex";
import { FB } from "@/config/firebase";
import moment from "moment";
export default {
  props: ["stockOrderId"],
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
        text: "Variant Name",
        align: "center",
        sortable: true,
        value: "variantName"
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
    dateMenu: false,
    selectedShipment: {
      logisticSTN: null,
      shipmentDate: null
    }
  }),
  created() {
    //run vuex to get corresponding shipment details for a stockOrder via the stockOrderId
    this.$store.dispatch("shipment/GetShipments", this.stockOrderId);
  },
  methods: {
    async UpdateShipmentStatus(shipment) {
      //updates hipmentstatus here
      console.log(shipment);
      let stockOrder;
      try {
        stockOrder = await this.$store.dispatch('stock_orders/GET_STOCK_ORDER', shipment.stockOrder.stockOrderId);
        console.log(stockOrder);

      } catch(error) {
        console.log(error);
        this.$swal.fire({
          type: "error",
          title: "Failed",
          text: `Shipment update has failed due to: ${e}`
        });
        return;
      }

      const shipmentDecrement = FB.firestore.FieldValue.increment(-1);
      let updateObj = {
        id: shipment.id,
        updatedDetails: {
          status: "Received"
        }
      };

      //if inventory counts for the items in the shipment are not yet deducted, then deduct it
      if(!stockOrder.hasOwnProperty('isQTYDeducted')) {
        for(const item of stockOrder.items) {
          let variant = await this.$store.getters['inventory/GET_ALL_PRODUCTS'];
          variant = variant.find(variant => variant.id === item.variantId);
          
          if(variant.allocatedQTY > 0) {
            await this.$store.dispatch('inventory/UPDATE_PRODUCT_DETAIL', {
              id: item.variantId,
              key: 'allocatedQTY',
              value: FB.firestore.FieldValue.increment(item.shippedQty * -1)
            });
          }
        }
      }
      
      let stockOrderUpdateObj = {
        referenceID: shipment.stockOrder.stockOrderId,
        updateObject: {
          shipmentsToReceive: shipmentDecrement
        }
      };
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

      const response = await this.$swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Cancel it!"
      });
      if (response.value) {
        let updateObj = {
          id: shipment.id,
          updatedDetails: {
            status: "Cancelled"
          }
        };

        //move this to Vuex or do this kind of updates in a cloud functions
        const shipmentDecrement = FB.firestore.FieldValue.increment(-1);
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
        let stockOrderUpdateObj = {
          referenceID: shipment.stockOrder.stockOrderId,
          updateObject: {
            shipmentsToReceive: shipmentDecrement,
            items: updatedStockOrderItems,
            status: stockOrderStatus,
            statusTimeline: updatedeStatusTimeline
          }
        };

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
        } catch (e) {
          this.$swal.fire({
            type: "error",
            title: "Failed",
            text: `Shipment update has failed due to: ${e}`
          });
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
  computed: {
    ...mapState("shipment", {
      shipmentList: state => state.shipmentList
    })
  }
};
</script>