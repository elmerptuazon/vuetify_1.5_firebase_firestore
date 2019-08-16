<template>
  <v-container>
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
              ></v-select
            ></v-container>
          </v-flex>
        </v-layout>
        <div class="mb-2"></div>
        <StockOrderItems :items="item.items" :loading="loading" />
      </v-card-text>
      <v-divider></v-divider>
      <!-- <v-card-actions v-if="item.status === 'pending'">
				<v-spacer></v-spacer>
				<v-btn color="green" dark large @click="updateStatus('delivered')">DELIVERED</v-btn>
				<v-btn color="green" outline dark large @click="updateStatus('collected')">COLLECTED</v-btn>
			</v-card-actions> -->
    </v-card>

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

export default {
  data: () => ({
    loading: false,
    item: {},
    status: ["Processing", "Paid", "Shipped", "Delivered", "Cancelled"],
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
    StockOrderItems
  },
  watch: {
    selectedStatus(val) {
      this.updateStatus(val.toLowerCase());
    }
  }
};
</script>
</template>
