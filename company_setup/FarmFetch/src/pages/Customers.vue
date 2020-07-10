<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <div class="headline">Customer Accounts</div>
        <v-spacer></v-spacer>
        <v-text-field
          append-icon="search"
          label="Search customer..."
          single-line
          hide-details
          v-model="search"
        ></v-text-field>
      </v-card-title>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="customersList"
        item-key="id"
        class="elevation-1"
        :loading="loading"
        :search="search"
        :rows-per-page-items="rowsPerPageItems"
      >
        <template slot="items" slot-scope="props">
          <tr>
            <td class="text-xs-center pa-2">
              <v-avatar size="80px" tile v-if="props.item.downloadURL">
                <img
                  :src="props.item.downloadURL"
                  :alt="props.item.firstName"
                />
              </v-avatar>
              <img
                :src="userPlaceholder"
                alt="no_image"
                v-else
                style="width: 50%;"
              />
            </td>
            <td class="text-xs-center">
              <span v-if="props.item.resellerData">
                {{ props.item.resellerData.agentId }}
              </span>
              <span v-else>
                No reseller
              </span>
            </td>
            <td class="text-xs-center">{{ props.item.firstName }}</td>
            <td class="text-xs-center">{{ props.item.middleInitial }}</td>
            <td class="text-xs-center">{{ props.item.lastName }}</td>
            <td class="text-xs-center">{{ props.item.birthday }}</td>
            <td class="text-xs-center">{{ props.item.gender }}</td>
            <td class="text-xs-center">{{ props.item.email }}</td>
            <td class="text-xs-center">{{ props.item.contact }}</td>
            <td class="text-xs-center">
              <v-btn
                icon
                color="primary"
                dark
                @click.stop="convertCustomer(props.item)"
              >
                <v-icon>compare_arrows</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import mixins from "@/mixins";
import { DB } from "@/config/firebase";
import { mapState } from "vuex";
import userPlaceholder from "@/assets/placeholder.png";
const usersCollection = DB.collection("accounts");

export default {
  data: () => ({
    items: [],
    loading: false,
    search: null,
    rowsPerPageItems: [10, 20, 30, { text: "All", value: -1 }],
    selected: [],
    headers: [
      {
        text: "Thumbnail",
        align: "center",
        sortable: false,
        value: "downloadURL"
      },
      {
        text: "Associated Reseller ID",
        value: "resellerData.agentId"
      },
      {
        text: "First name",
        value: "firstName"
      },
      {
        text: "Middle initial",
        value: "middleInitial"
      },
      {
        text: "Last name",
        value: "lastName"
      },
      {
        text: "Birthday",
        value: "birthday"
      },
      {
        text: "Gender",
        value: "gender"
      },
      {
        text: "Email",
        value: "email"
      },
      {
        text: "Contact",
        value: "contact"
      },
      {
        text: "Actions",
        sortable: false
      }
    ],
    userPlaceholder: userPlaceholder
  }),
  async created() {
    this.fetchCustomers();
  },
  methods: {
    async fetchCustomers() {
      this.loading = true;
      await this.$store.dispatch("users/GetCustomers");
      this.loading = false;
    },
    async convertCustomer(customer) {
      //   const r = await this.$swal.fire({
      //     title: "Customer Convertion",
      //     text: `Are you sure you want to convert ${customer.firstName} into a reseller?`,
      //     type: "warning",
      //     showCancelButton: true,
      //     confirmButtonText: "Yes",
      //     cancelButtonText: "No",
      //     showCloseButton: true
      //   });

      //   if (!r.value) {
      //     return;
      //   } else {
      //     await this.$store.dispatch("users/ConvertCustomer", customer);
      //     this.$swal.fire({
      //       type: "success",
      //       title: "Success!",
      //       text: "Customer succesfully converted to a Reseller!"
      //     });
      //   }

      const convertDialog = await this.$swal.mixin({
        type: "info",
        showCancelButton: true,
        showCloseButton: true,
        progressSteps: ["1", "2"]
      });
      const resellerId = await convertDialog.queue([
        {
          title: "Customer Upgrade",
          text: `Are you sure you want to convert ${customer.firstName} into a reseller?`,
          confirmButtonText: "Yes",
          cancelButtonText: "No"
        },
        {
          title: "Customer Upgrade",
          text: "Please input a Reseller ID for the customer upgrade",
          input: "text",
          inputValidator: resellerId => {
            if (!resellerId) {
              return "You need to input something!";
            } else if (isNaN(resellerId)) {
              return "Input should be valid number!";
            }
          },
          showLoaderOnConfirm: true,
          preConfirm: async resellerId => {
            customer.agentId = resellerId;
            await this.$store.dispatch("users/ConvertCustomer", customer);
          }
        }
      ]);

      //   this.$swal.fire({
      //     type: "success",
      //     title: "Success!",
      //     text: "Customer succesfully converted to a Reseller!"
      //   });
    }
  },
  mixins: [mixins],
  computed: {
    ...mapState("users", {
      customersList: state => state.customers
    })
  }
};
</script>
