<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <v-layout>
          <v-flex xs3> <div class="headline">Shipment List Report</div></v-flex>
          <v-flex xs9>
            <v-layout align-start justify-end row fill-height>
              <v-flex>
                <v-menu
                  lazy
                  :close-on-content-click="false"
                  v-model="fromMenu"
                  transition="scale-transition"
                  offset-y
                  full-width
                  :nudge-right="40"
                  max-width="290px"
                  min-width="290px"
                >
                  <v-text-field
                    slot="activator"
                    label="Date from"
                    v-model="fromDate"
                    prepend-icon="event"
                    readonly
                  ></v-text-field>
                  <v-date-picker
                    v-model="fromDate"
                    @input="fromMenu = false"
                    no-title
                  ></v-date-picker> </v-menu
              ></v-flex>
              <v-flex>
                <v-menu
                  lazy
                  :close-on-content-click="false"
                  v-model="toMenu"
                  transition="scale-transition"
                  offset-y
                  full-width
                  :nudge-right="40"
                  max-width="290px"
                  min-width="290px"
                >
                  <v-text-field
                    slot="activator"
                    label="Date to"
                    v-model="toDate"
                    prepend-icon="event"
                    readonly
                  ></v-text-field>
                  <v-date-picker
                    v-model="toDate"
                    @input="toMenu = false"
                    no-title
                  ></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex>
                <div class="text-xs-center">
                  <v-select
                    v-model="selectedFilter"
                    :items="filters"
                    menu-props="auto"
                    label="Filter"
                    prepend-icon="filter_list"
                  ></v-select>
                </div>
              </v-flex>
              <v-flex>
                <div class="text-xs-center">
                  <v-btn @click="GenerateShipmentReport" color="primary"
                    >Generate Report</v-btn
                  >
                </div>
              </v-flex>
              <v-flex>
                <v-btn color="success">
                  <download-excel
                    :data="exportData"
                    :fields="json_fields"
                    :before-generate="PrepareDataForDownload"
                    :before-finish="PromptEndOfDownload"
                    worksheet="Shipments"
                    name="Shipments.xls"
                  >
                    Export To excel
                  </download-excel></v-btn
                >
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table
        :headers="headers"
        :items="shipmentList"
        class="elevation-1"
        :loading="loading"
        item-key="trackingNumber"
        expand
      >
        <template slot="items" slot-scope="props">
          <tr @click="props.expanded = !props.expanded">
            <td class="text-xs-center">
              <v-icon v-if="props.expanded">keyboard_arrow_up</v-icon>
              <v-icon v-else>keyboard_arrow_down</v-icon>
            </td>
            <td class="text-xs-center">{{ props.item.trackingNumber }}</td>
            <td class="text-xs-left">
              {{ props.item.stockOrder.stockOrderReference }}
            </td><td class="text-xs-left">
              {{ props.item.userDetails.branchName }}
            </td>
            <!-- <td class="text-xs-left">
              {{
                props.item.userDetails.lastName +
                  ", " +
                  props.item.userDetails.firstName +
                  " " +
                  props.item.userDetails.middleInitial
              }}
            </td> -->
            <td class="text-xs-center">{{ props.item.userDetails.agentId }}</td>
            <td class="text-xs-left">
              {{ props.item.userDetails.address.house }},{{
                props.item.userDetails.address.streetName
              }},{{ props.item.userDetails.address.barangay }},{{
                props.item.userDetails.address.citymun
              }},{{ props.item.userDetails.address.province }},{{
                props.item.userDetails.address.zipCode
              }}
            </td>
            <td class="text-xs-center">{{ props.item.userDetails.contact }}</td>
            <td class="text-xs-center">
              {{
                props.item.stockOrder.dateSubmitted | momentize("YYYY/MM/DD")
              }}
            </td>
          </tr>
        </template>
        <template slot="expand" slot-scope="props">
          <v-container>
            <v-data-table
              hide-actions
              :headers="subHeaders"
              :items="props.item.itemsToShip"
              class="elevation-1"
            >
              <template slot="items" slot-scope="props">
                <td class="text-xs-left">{{ props.item.productName }}</td>
                <td class="text-xs-left">{{ props.item.price }}</td>
                <td class="text-xs-left">{{ props.item.qtyToShip }}</td>
              </template>
            </v-data-table>
          </v-container>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import mixins from "@/mixins";
export default {
  data: () => ({
    fromDate: new Date().toISOString().substr(0, 10),
    fromMenu: false,
    toDate: new Date().toISOString().substr(0, 10),
    toMenu: false,
    filters: ["Pick-Up Date", "Process Date"],
    selectedFilter: "Pick-Up Date",
    loading: false,
    headers: [
      {
        text: "",
        sortable: false
      },
      {
        text: "Shipment Number",
        align: "center",
        value: "trackingNumber"
      },
      {
        text: "Order Number",
        value: "name",
        align: "center",
        value: "stockOrder.stockOrderReference"
      },
      {
        text: "Branch Name",
        value: "userDetails.branchName",
        align: "center"
      },
      {
        text: "Branch ID",
        value: "userDetails.agentId",
        align: "center"
      },
      {
        text: "Shipping Address",
        value: "userDetails.address.house",
        align: "center"
      },
      {
        text: "Contact",
        value: "userDetails.contact",
        align: "center"
      },
      {
        text: "Date Requested",
        value: "stockOrder.dateSubmitted",
        align: "center"
      }
    ],
    subHeaders: [
      {
        text: "Product Name",
        align: "center",
        sortable: true,
        value: "productName"
      },
      {
        text: "Price",
        align: "center",
        sortable: true
      },
      {
        text: "Qty to Ship",
        value: "qtyToShip",
        align: "center"
      }
    ],
    exportData: [],
    json_fields: {
      "Date Requested": "dateRequested",
      "Shipment Number": "shipmentNumber",
      "Order Number": "orderNumber",
      "Branch Name": "branchName",
      "Branch Id": "branchId",
      "Shipping Address": "shippingAddress",
      Contact: "contact",
      Item: "itemName",
      Price: "itemPrice",
      Quantity: "qty"
    }
  }),
  mounted() {
    this.ClearShipmentList();
  },
  methods: {
    ...mapMutations("shipment", ["ClearShipmentList"]),
    async GenerateShipmentReport() {
      this.loading = true;
      if (this.fromDate > this.toDate) {
        this.$swal.fire(
          "Please Try Again!",
          "Date From should always be less than or equal to Date To field.",
          "info"
        );
        return;
      }
      let dateRange = {
        fromDate: this.fromDate,
        toDate: this.toDate
      };
      await this.$store.dispatch("shipment/GetShipmentsByDate", {
        dateRange: dateRange,
        filter: this.selectedFilter
      });
      this.loading = false;
    },
    PrepareDataForDownload() {
      for (let shipment of this.shipmentList) {
        for (let item of shipment.itemsToShip) {
          let data = {
            shipmentNumber: shipment.trackingNumber,
            orderNumber: shipment.stockOrder.stockOrderReference,
             branchName:
              shipment.userDetails.branchName,
            // customerName:
            //   shipment.userDetails.lastName +
            //   ", " +
            //   shipment.userDetails.firstName +
            //   " " +
            //   shipment.userDetails.middleInitial,
            branchId: shipment.userDetails.agentId,
            shippingAddress:
              shipment.userDetails.address.house +
              "," +
              shipment.userDetails.address.streetName +
              "," +
              shipment.userDetails.address.barangay +
              "," +
              shipment.userDetails.address.citymun +
              "," +
              shipment.userDetails.address.province +
              "." +
              shipment.userDetails.address.zipCode,
            contact: shipment.userDetails.contact,
            dateRequested: this.$options.filters.momentize(
              shipment.stockOrder.dateSubmitted,
              "YYYY/MM/DD"
            ),
            itemName: item.productName,
            itemPrice: item.price,
            qty: item.qtyToShip
          };
          this.exportData.push(data);
        }
      }
    },
    PromptEndOfDownload() {
      this.$swal.fire(
        "Success!",
        "Download of Shipments in Excel is complete!",
        "success"
      );
    }
  },
  computed: {
    ...mapState("shipment", {
      shipmentList: state => state.shipmentList
    })
  },
  mixins: [mixins]
};
</script>

<style lang="scss" scoped>
</style>