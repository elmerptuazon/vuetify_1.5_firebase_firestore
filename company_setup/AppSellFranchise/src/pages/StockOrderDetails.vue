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
                          {{ stockOrder.user.branchName }} - {{ stockOrder.user.agentId }}
                        </v-list-tile-title>
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
                          <span 
                            class="primary--text" 
                            v-if="
                              (stockOrder.status.toLowerCase() === 'shipped' || stockOrder.status.toLowerCase() === 'partially shipped') && 
                              stockOrder.shipmentsToReceive > 0
                            "
                          >
                            {{ "scheduled for shipping" | uppercase }}
                          </span>
                          <span class="primary--text" v-else >{{
                            stockOrder.status | uppercase
                          }}</span>
                        </v-list-tile-title>
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
                    @click="UpdatePayment('paid')"
                    color="primary"
                    :class="[
                      stockOrder.paymentDetails.paymentStatus.toLowerCase() === 'paid'
                        ? 'v-btn--disabled '
                        : '',
                      stockOrder.paymentDetails.paymentStatus.toLowerCase() === '-'
                        ? 'v-btn--disabled '
                        : ''
                    ]"
                    >Tag as Paid</v-btn
                  >
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-list subheader>
                    <v-list-tile
                      ><v-list-tile-content>
                        <v-list-tile-sub-title
                          >Total Amount</v-list-tile-sub-title
                        >
                        <v-list-tile-title
                          >{{ stockOrder.paymentDetails.amount | currency("&#8369; ") }}
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                    
                    <v-list-tile class="mt-2"
                      ><v-list-tile-content>
                        <v-list-tile-sub-title>Status</v-list-tile-sub-title>
                        <v-list-tile-title>
                          <span class="primary--text" v-if="stockOrder.paymentDetails.paymentStatus === 'pending'">{{
                             'PROOF OF PAYMENT' | uppercase
                          }}</span>
                          <span class="primary--text" v-else>{{
                            stockOrder.paymentDetails.paymentStatus | uppercase
                          }}</span>
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                  
                  <v-layout row align-center justify-start wrap px-2>
                    <v-flex xs12>
                      <div class="body-1 grey--text">Proof of Payment</div>
                    </v-flex>
                    <v-flex xs12 mt-2>
                      <v-img
                        v-if="stockOrder.paymentDetails.proofOfPayment"
                        :src="stockOrder.paymentDetails.proofOfPayment"
                        :lazy-src="placeholder"
                        max-height="250px"
                        max-width="250px"
                        style="border: solid 2px;"
                      >
                        <v-layout align-center justify-center>
                          <v-btn 
                            v-if="stockOrder.paymentDetails.proofOfPayment"
                            color="primary" @click="enlargeDialog = true"
                            class="overlayImage" depressed
                          >Enlarge</v-btn>
                        </v-layout>
                      </v-img>

                      <v-img 
                        v-else
                        :src="placeholder" 
                        :lazy-src="placeholder"
                        height="250px"
                        width="250px" 
                      >
                        <v-layout align-center justify-center>
                          <div
                            class="
                              body-2 
                              pa-1
                              font-weight-bold
                              primary
                              white--text 
                              overlayImage"
                          >NO PROOF OF PAYMENT YET</div>
                        </v-layout>
                      </v-img>
                    </v-flex>
                    
                    <v-flex 
                      xs12 mt-3
                      v-if="stockOrder.paymentDetails.paymentStatus === 'pending'"
                    >
                      <v-btn block color="red" outline @click="UpdatePayment('denied')">
                        TAG AS DENIED
                      </v-btn>
                    </v-flex>
                  </v-layout>
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

                    <!-- Display shipping fee when it is not a free delivery and is not for pick-up -->
                    <v-list-tile
                      v-if="stockOrder.logisticsDetails.logisticProvider.toLowerCase() !== 'pick-up'"
                      ><v-list-tile-content>
                        <v-list-tile-sub-title
                          >Shipping Fee</v-list-tile-sub-title
                        >
                        <v-list-tile-title>
                          <span v-if="stockOrder.logisticsDetails">{{
                            stockOrder.logisticsDetails.shippingFee | currency("&#8369; ")
                          }}</span>
                          <span v-else>N/A</span>
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile 
                      v-if="
                        stockOrder.logisticsDetails.isFreeShipping
                        && stockOrder.logisticsDetails.logisticProvider.toLowerCase() !== 'pick-up'
                      ">
                      <v-list-tile-content>
                        <v-list-tile-sub-title
                          >Is this a Free Delivery?</v-list-tile-sub-title
                        >
                        <v-list-tile-title>
                          <span v-if="stockOrder.logisticsDetails.isFreeShipping">YES</span>
                          <span v-else>NO</span>
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
              :loading="updateBtnLoading"
              :class="[
                stockOrder.status.toLowerCase() !== 'pending'
                  ? 'v-btn--disabled'
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
              :loading="cancelBtnLoading"
              :disabled="cancelBtnLoading"
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
    </v-card>

    <div class="mb-2"></div>

    <v-dialog v-model="enlargeDialog" max-width="600">
      <v-card>
        <v-img
          :src="stockOrder.paymentDetails.proofOfPayment"
          :lazy-src="placeholder"
          contain
          v-if="stockOrder.paymentDetails.proofOfPayment"
        >
          <v-layout
            slot="placeholder"
            fill-height
            align-center
            justify-center
            ma-0
          >
            <v-progress-circular
              indeterminate
              color="grey lighten-5"
            ></v-progress-circular>
          </v-layout>
        </v-img>
      </v-card>
    </v-dialog>

    <v-card>
      <v-card-title class="title">Shipment Details</v-card-title>
      <ShipmentDetails :stockOrderId="stockOrder.id" />
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
              <v-flex xs8>
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
              <v-flex xs4>
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
            </v-layout>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" dark @click="SubmitShipment">
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
import Placeholder from '@/assets/no-image.png';
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
    menu: false,

    updateBtnLoading: false,
    cancelBtnLoading: false,

    enlargeDialog: false,
    placeholder: null,

    //tells the partialShipment component if the previously created
    //partial shipment list has been submitted already
    completed: false
  }),
  async created() {
    this.placeholder = Placeholder;

    this.loading = true;
    try {
      const id = this.$route.params.id;
      
      if(!this.stockOrder.isRead) {
        await this.$store.dispatch('stock_orders/UPDATE_STOCK_ORDER_DETAILS', {
          referenceID: id,
          updateObject: { isRead: true }
        });
      }

      const QTYIsDeducted = (!this.stockOrder.isQTYDeducted || !this.stockOrder.hasOwnProperty('isQTYDeducted'));
      const shipmentsToRecieve = this.stockOrder.shipmentsToReceive === 0;
      const isStockOrderShipped = (this.stockOrder.status === 'shipped' || this.stockOrder.status === 'partially shipped');
      
      console.log(QTYIsDeducted, shipmentsToRecieve, isStockOrderShipped);
      
      if((QTYIsDeducted && shipmentsToRecieve) && isStockOrderShipped) {
        for(const item of this.stockOrder.items) {
          let updatedVariant = {
            allocatedQTY: FB.firestore.FieldValue.increment(item.shippedQty * -1),
            onHandQTY: FB.firestore.FieldValue.increment(item.shippedQty * -1) 
          };

          await this.$store.dispatch('inventory/UPDATE_MULTIPLE_PRODUCT_FIELDS', {
            id: item.variantId,
            updatedDetails: updatedVariant
          });
        }

        await this.$store.dispatch('stock_orders/UPDATE_STOCK_ORDER_DETAILS', {
          referenceID: id,
          updateObject: { isQTYDeducted: true }
        });
      }

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
    },
    SetItemsToShip(items) {
      this.itemsToShip = items.map(item => {
        const itemToShip = {
          attributes: item.attributes,
          qtyToShip: item.qtyToShip,
          productName: item.name,
          productId: item.productId,
          price: item.price,
          variantId: item.variantId,
          sku: item.sku,
          variantName: item.variantName,
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
      if(status === 'processing') {
        this.updateBtnLoading = true;
      }
      else if(status === 'cancelled') {
        this.cancelBtnLoading = true;
      }

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

        //adjust the allocatedQTY field of the variants associated to this stockOrder
        if(status === 'cancelled') {
          for(const item of this.stockOrder.items) {
            await this.$store.dispatch('inventory/UPDATE_PRODUCT_DETAIL', {
              id: item.variantId,
              key: 'allocatedQTY',
              value: FB.firestore.FieldValue.increment(item.qty * -1), //decrement the allocatedQTY field of the variant
            });
          }
        }

        //this.stockOrder.status = status;
        this.$refs.toast.show(
          "success",
          "Order has been successfully marked as " + status
        );

        this.updateBtnLoading = false;
        this.cancelBtnLoading = false;
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

      const response = await this.$swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Submit it!"
      });

      const pickupDate = Date.parse(moment(this.pickupDate).startOf("day"));

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
                price: item.price,
                variantId: item.variantId,
                sku: item.sku,
                variantName: item.variantName,
                qtyToShipPriceTotal:
                  item.price * (item.qty - item.shippedQty)
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
                branchName: this.stockOrder.user.branchName,
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
              pickupDate: pickupDate
            };
            //call vuex and pass this.shipmentDetails
            const response = await this.$store.dispatch(
              "shipment/SubmitShipment",
              this.shipmentDetails
            );
            //console.log(response);
            //after saving the Shipment Details, Update the Stock Order Values and Status
            const remainingStockOrderItems = this.stockOrder.items.map(item => {
              const updatedStockOrder = {
                attributes: item.attributes,
                price: item.price,
                productId: item.productId,
                qty: item.qty,
                unique: item.unique,
                variantId: item.variantId,
                sku: item.sku,
                variantName: item.variantName,
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
            const shipmentIncrement = FB.firestore.FieldValue.increment(1);
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
                stockOrderReference: this.stockOrder.stockOrderReference,
                stockOrderId: this.stockOrder.id,
                dateSubmitted: this.stockOrder.submittedAt
              },
              userDetails: {
                firstName: this.stockOrder.user.firstName,
                lastName: this.stockOrder.user.lastName,
                middleInitial: this.stockOrder.user.middleInitial,
                branchName: this.stockOrder.user.branchName,
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
              pickupDate: pickupDate
            };
            //call vuex and pass this.shipmentDetails
            const response = await this.$store.dispatch(
              "shipment/SubmitShipment",
              this.shipmentDetails
            );
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
                  variantId: item.variantId,
                  sku: item.sku,
                  variantName: item.variantName,
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
                  variantId: item.variantId,
                  sku: item.sku,
                  variantName: item.variantName,
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
              const shipmentIncrement = FB.firestore.FieldValue.increment(1);
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
              const shipmentIncrement = FB.firestore.FieldValue.increment(1);
              const stockOrderUpdatedData = {
                status: "partially shipped",
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

              this.shipmentDialog = false;
              this.$swal.fire({
                type: "success",
                title: "Success",
                text: "Partial shipment has been recorded!"
              });

              this.completed = true;
              //"completed" variable has to be true since the created partial shipment
              //has been recorded already
              //this will ensure that the partialShipment component wont display the previously created partial shipment list
            }
          } catch (error) {
            this.$swal.fire({
              type: "error",
              title: "Failed",
              text: `Partial shipment creation has failed due to: ${error}`
            });

            this.completed = true;
            //"completed" variable has to be true since the created partial shipment
            //has been recorded already
          }
        }
      }
      this.date = null;
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
    async UpdatePayment(action) {
      const response = await this.$swal.fire({
        title: "Are you sure?",
        text: `Are you sure you want to tag the payment of this order as ${action.toUpperCase()}?`,
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
            paymentDetails: this.stockOrder.paymentDetails,
          };

          updateObj.paymentDetails.paymentStatus = action;
          updateObj.paymentDetails.paymentDate = Date.now();

          if(action === 'denied') {
            updateObj.read = false;  
            delete updatedObj.id;

            await this.$store.dispatch(
              "stock_orders/UPDATE_STOCK_ORDER_DETAILS", {
                referenceID: this.$route.params.id,
                updateObject: updateObj
              }
            );

          } else {
            await this.$store.dispatch(
              "stock_orders/UPDATE_STOCK_ORDER_PAYMENT_DETAILS",
              updateObj
            );
          }

          

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
<style scoped>

  .overlayImage {
    position: absolute;
    top: 50%;
    z-index: 1;
  }

</style>
