<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-flex
        xs12
        v-for="shipment in shipmentList"
        :key="shipment.trackingNumber"
      >
        <v-card class="mt-2" color="white">
          <v-card-title class="title">
            <v-layout row wrap align-center justify-start>
              <v-flex xs12> 
                Parcel ID: {{ shipment.trackingNumber }}
              </v-flex>

              <v-flex xs12 md4>
                <v-btn
                  color="success"
                  v-show="shipment.status.toLowerCase() === 'pending'"
                  @click="UpdateShipmentStatus(shipment)"
                  >This shipment has been received by the Customer</v-btn
                >
              </v-flex>

              <v-flex xs12 md3 offset-md1>
                <v-btn
                  color="error"
                  v-show="shipment.status.toLowerCase() === 'pending'"
                  @click="cancelShipment(shipment)"
                  >Cancel this shipment</v-btn
                >
              </v-flex>  

              <v-flex xs12 md4>
                <v-btn
                  color="primary"
                  @click="printShipmentDetails(shipment)"
                  >Print this Shipment Details</v-btn
                >
              </v-flex>
            </v-layout>
          </v-card-title>

          <v-card-text>
            <v-layout align-center justify-space-around row wrap>
              <v-flex xs12 md4>
                <v-container
                  ><v-card flat>
                    <v-card-text>
                      <v-list subheader>
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
                              {{
                                shipment.userDetails.address.province
                              }}</v-list-tile-title
                            >
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
                              >{{ shipment.status }}
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile v-if="shipment.shipmentDate"
                          ><v-list-tile-content>
                            <v-list-tile-sub-title
                              >Shipment Delivery Date</v-list-tile-sub-title
                            >
                            <v-list-tile-title
                              >{{ shipment.shipmentDate | momentize("DD-MMM-YYYY") }}
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile v-if="shipment.logisticSTN"
                          ><v-list-tile-content>
                            <v-list-tile-sub-title
                              >Logistic's Shipment Tracking Number</v-list-tile-sub-title
                            >
                            <v-list-tile-title
                              >{{ shipment.logisticSTN }}
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>
                    </v-card-text>
                  </v-card></v-container
                >
              </v-flex>
              <v-flex xs12 md8>
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
          <v-layout 
            row 
            wrap
            v-if="!shipment.logisticSTN && shipment.status.toLowerCase() === 'pending'" 
            px-3
            >
            <v-flex xs4>
              <v-btn 
                color="primary" 
                @click="toggleTextbox"
                v-show="!showTextbox"
                >ADD LOGISTIC'S SHIPMENT TRACKING NUMBER</v-btn
              >
            </v-flex>
            <v-flex xs12>
              <v-layout row v-show="showTextbox">
                <v-flex xs6>
                  <v-text-field 
                    v-model="logisticSTN"
                    label="Logistic's Shipment Tracking Number"
                    placeholder="please enter the Logistic's Shipment Tracking Number..."
                    clearable
                    >
                  </v-text-field>
                </v-flex>
                <v-flex xs1>
                  <v-btn flat @click="toggleTextbox">CANCEL</v-btn>
                </v-flex>
                <v-flex xs1 ml-3>
                  <v-btn 
                    color="primary" 
                    @click="addLogisticSTN(shipment)"
                    :loading="btnloading"
                    >SUBMIT
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
          
          <v-layout class="mt-0 pt-0" align-center>
            <v-flex xs4>
              <div class="body-2"></div>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import mixins from "@/mixins";
import { mapState } from "vuex";
import { FB } from "@/config/firebase";
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
        text: "Qty to Ship",
        value: "qtyToShip",
        align: "center"
      }
    ],
    showTextbox: false,
    logisticSTN: null,
    btnloading: false,
  }),
  created() {
    //run vuex to get corresponding shipment details for a stockOrder via the stockOrderId
    this.$store.dispatch("shipment/GetShipments", this.stockOrderId);
  },
  methods: {
    toggleTextbox() {
      this.showTextbox = !this.showTextbox;
      this.logisticSTN = null;
    },
    async UpdateShipmentStatus(shipment) {
      //updates hipmentstatus here
      console.log(shipment);
      const shipmentDecrement = FB.firestore.FieldValue.increment(-1);
      let updateObj = {
        id: shipment.id,
        updatedDetails: {
          status: "Received"
        },
        stockOrderID: shipment.stockOrder.stockOrderId,
        updatedStockOrderDetails: {
          shipmentsToReceive: shipmentDecrement
        }
      };
      try {
        await this.$store.dispatch("shipment/UpdateShipment", updateObj);
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
      console.log(shipment);
      const shipmentDecrement = FB.firestore.FieldValue.increment(-1);
      let updateObj = {
        id: shipment.id,
        updatedDetails: {
          status: "Cancelled"
        },
        stockOrderID: shipment.stockOrder.stockOrderId,
        updatedStockOrderDetails: {
          shipmentsToReceive: shipmentDecrement
        }
      };
      try {
        await this.$store.dispatch("shipment/UpdateShipment", updateObj);
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
    async addLogisticSTN(shipment) {
      this.btnloading = true;

      if(!this.logisticSTN) {
        this.$swal.fire({
          type: "error",
          title: "Missing Logistic's Shipment Tracking Number",
          text: `Please provide the Logistic's Shipment Tracking Number`
        });
        return;
      }

      console.log(shipment);
      let updateObj = {
        id: shipment.id,
        updatedDetails: {
          logisticSTN: this.logisticSTN
        },
        stockOrderID: shipment.stockOrder.stockOrderId,
        updatedStockOrderDetails: {

        }
      };
      try {
        await this.$store.dispatch("shipment/UpdateShipment", updateObj);
        this.$swal.fire({
          type: "success",
          title: "Success",
          text: "Logistic's Shipment Tracking Number has been added!"
        });
        this.btnloading = false;
      } catch (e) {
        this.$swal.fire({
          type: "error",
          title: "Failed",
          text: `Shipment update has failed due to: ${e}`
        });
        this.btnloading = false;
      }
      this.logisticSTN = null;
      this.showTextbox = false;
    },
    printShipmentDetails(shipment) {
      
      
      const date = new Date(shipment.shipmentDate);
      if(date) {
        const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        shipment.shipmentDate = `${month[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
      }
      else {
        shipment.shipmentDate = null;
      }
      
      //create the html code for the "items to be ship" table
      let itemsToShipHTML = "<table><tr><th>Product Name</th><th>Qty to Ship</th></tr>";

      for(let i = 0; i < shipment.itemsToShip.length; i++) {
        const item = shipment.itemsToShip[i];
        itemsToShipHTML += "<tr>";
        itemsToShipHTML += "<td>" + item.productName + "</td>" + "<td>" + item.qtyToShip + "</td>";
        itemsToShipHTML += "</tr>";
      }

      itemsToShipHTML += "</table>";

      // Open the print window
      const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');

      WinPrint.document.write(`<!DOCTYPE html>
      <html>
        <head>
         <style>
          
          body {
            margin-left: 30px;
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
              <td>${shipment.userDetails.firstName || ""} ${shipment.userDetails.middleInitial || ""} ${shipment.userDetails.lastName || ""}</td>
            </tr>
            <tr>
              <td class="title">Stock Order Reference Number</td>
              <td>${shipment.stockOrder.stockOrderReference || ""}</td>
            </tr>
            <tr>
              <td class="title">Address</td>
              <td>${shipment.userDetails.address.house || ""} ${shipment.userDetails.address.streetName || ""} ${shipment.userDetails.address.baranggay || ""} ${shipment.userDetails.address.citymun || ""} ${shipment.userDetails.address.province}</td>
            </tr>
            <tr>
              <td class="title">Shipment Type</td>
              <td>${shipment.type || ""}</td>
            </tr>
            <tr>
              <td class="title">Shipment Status</td>
              <td>${shipment.status || ""}</td>
            </tr>
            <tr>
              <td class="title">Shipment Delivery Date</td>
              <td>${shipment.shipmentDate || ""}</td>
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