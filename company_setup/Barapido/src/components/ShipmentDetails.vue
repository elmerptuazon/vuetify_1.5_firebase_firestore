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
            Shipment Tracking Number: {{ shipment.trackingNumber }}
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              v-if="shipment.status.toLowerCase() === 'pending'"
              @click="UpdateShipmentStatus(shipment)"
              >This shipment has been received by the Customer</v-btn
            >
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
    ]
  }),
  created() {
    //run vuex to get corresponding shipment details for a stockOrder via the stockOrderId
    this.$store.dispatch("shipment/GetShipments", this.stockOrderId);
  },
  methods: {
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
    }
  },
  computed: {
    ...mapState("shipment", {
      shipmentList: state => state.shipmentList
    })
  }
};
</script>
