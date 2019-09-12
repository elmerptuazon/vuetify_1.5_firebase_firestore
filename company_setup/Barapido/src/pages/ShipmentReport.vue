<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <div class="headline">Shipment Report</div>
        <v-spacer></v-spacer>
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
            label="Date to be Generated"
            v-model="date"
            prepend-icon="event"
            readonly
          ></v-text-field>
          <v-date-picker
            v-model="date"
            @input="menu = false"
            no-title
          ></v-date-picker>
        </v-menu>
        <v-btn @click="GenerateShipmentReport">Generate Shipment List</v-btn>
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
            </td>
            <td class="text-xs-left">
              {{
                props.item.userDetails.lastName +
                  ", " +
                  props.item.userDetails.firstName +
                  " " +
                  props.item.userDetails.middleInitial
              }}
            </td>
            <td class="text-xs-left">address dawss</td>
            <td class="text-xs-center">{{ props.item.userDetails.contact }}</td>
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
                <td class="text-xs-left">$$$</td>
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

export default {
  data: () => ({
    date: new Date().toISOString().substr(0, 10),
    menu: false,
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
        text: "Customer Name",
        //value: "attributes",
        align: "center"
      },
      {
        text: "Shipping Address",
        //value: "qty",
        align: "center"
      },
      {
        text: "Contact",
        value: "userDetails.contact",
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
    ]
  }),
  mounted() {
    this.ClearShipmentList();
  },
  methods: {
    ...mapMutations("shipment", ["ClearShipmentList"]),
    async GenerateShipmentReport() {
      this.loading = true;
      await this.$store.dispatch("shipment/GetShipmentsByDate", this.date);
      this.loading = false;
      console.log(this.shipmentList);
    }
  },
  computed: {
    ...mapState("shipment", {
      shipmentList: state => state.shipmentList
    })
  }
};
</script>

<style lang="scss" scoped>
</style>