<template>
  <v-container fluid>
    <v-card>
      <v-container>
        <v-layout align-center justify-start row>
          <v-flex xs4>
            <div class="headline">
              New Registrations
              <span>
                <v-tooltip bottom color="primary" dark>
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                      <v-icon color="grey lighten-1">help</v-icon>
                    </v-btn>
                  </template>
                  <span>
                    <b>NOTE:</b> New Reseller Registrations are automatically shown on top of the list in real-time,<br/> 
                    please refrain from refreshing this page.
                  </span>
                </v-tooltip>
              </span>
            </div>
          </v-flex>

          <v-flex xs7 offset-xs1>
            <v-text-field
              append-icon="search"
              label="Search user..."
              dense
              v-model="search"
            ></v-text-field>
          </v-flex>
        </v-layout>

        <v-layout align-center justify-start mt-4>
          <div 
            v-for="status in statuses"
            :key="status.name"
            class="mr-2"
          >
            <v-chip
              :active="status.count"
              :class="[status.count === 0 ? 'grey' : 'primary']"
              :outline="status.count === 0"
              dark small
            >
              <div class="font-weight-thin overline">
                {{ status.name }} Resellers 
                <span class="font-weight-bold">
                  : {{ status.count }}
                </span>
              </div>
            </v-chip>
          </div>
        </v-layout>
      </v-container>
      
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="items"
        item-key="id"
        class="elevation-1"
        :loading="loading"
        :search="search"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
      >
        <template slot="items" slot-scope="props">
          <tr
            :class="[props.item.status === 'pending' ? 'blue lighten-4' : '']"
          >
            <!-- <td class="text-xs-left">{{ props.item.id }} <v-btn flat icon @click="copy($event, props.item)"><v-icon>file_copy</v-icon></v-btn></td> -->
            <td class="text-xs-center pa-2">
              <v-avatar size="80px" tile v-if="props.item.downloadURL">
                <v-img
                  :src="props.item.downloadURL"
                  :alt="props.item.firstName"
                  contain
                ></v-img>
              </v-avatar>
              <img
                :src="userPlaceholder"
                alt="no_image"
                v-else
                style="width: 50%;"
              />
            </td>
            <td class="text-xs-left">{{ props.item.firstName }}</td>
            <td class="text-xs-left">{{ props.item.middleInitial || "" }}</td>
            <td class="text-xs-left">{{ props.item.lastName }}</td>
            <td class="text-xs-left">
              {{ props.item.birthday | momentize("MMMM D, YYYY") }}
            </td>
            <td class="text-xs-left">{{ props.item.address.citymun }}</td>
            <td class="text-xs-left">{{ props.item.address.province }}</td>
            <td class="text-xs-left">
              {{ props.item.createdAt | momentize("MMMM D, YYYY") }}
            </td>
            <td class="text-xs-left">
              <span
                v-if="props.item.status === 'pending'"
                class="primary--text"
              >
                <strong>PENDING</strong>
              </span>
              <span
                v-if="props.item.status === 'approved'"
                class="green--text text--darken-1"
              >
                <strong>APPROVED</strong>
              </span>
              <span
                v-else-if="props.item.status === 'denied'"
                class="red--text"
              >
                <strong>DENIED</strong>
              </span>
            </td>
            <td class="text-xs-center">
              <v-btn
                icon
                color="primary"
                dark
                @click.stop="viewUser(props.item)"
              >
                <v-icon>remove_red_eye</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
    <Toast ref="toast" />
  </v-container>
</template>

<script>
import mixins from "@/mixins";
import { DB } from "@/config/firebase";
import userPlaceholder from "@/assets/placeholder.png";
import ClipboardJS from "clipboard";
import Toast from "@/components/Toast";

export default {
  created() {
    this.loading = true;
  },
  data: () => ({
    search: null,
    rowsPerPageItems: [10, 20, 30, { text: "All", value: -1 }],
    pagination: {
      sortBy: "Application Date"
    },
    selected: [],
    headers: [
      {
        text: "Thumbnail",
        align: "center",
        sortable: false,
        value: "id"
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
        text: "Birth Date",
        value: "birthday"
      },
      {
        text: "City",
        value: "address.citymun"
      },
      {
        text: "Province",
        value: "address.province"
      },
      {
        text: "Application Date",
        value: "createdAt"
      },
      {
        text: "Status",
        value: "status"
      },
      {
        text: "Action",
        align: "center",
        sortable: false,
        value: "id"
      }
    ],
    loading: false,

    statuses: [],
    statusType: ['Unread', 'Pending', 'Approved', 'Denied'],
  }),
  async created() {
    this.loading = true;
    // try {
    //   const data = await this.$store.dispatch("distributors/FIND_ALL");

    //   console.log(data);
    //   this.items = data;
    // } catch (error) {
    //   console.log(error);
    // }
    this.loading = false;
  },
  methods: {
    viewUser(account) {
      this.$router.push({
        name: "RegistrationDetails",
        params: { uid: account.id, account }
      });
    },
    computeStatusNumbers(resellers) {
      this.statuses = [];
      this.statusType.forEach(status => {
        let entry = {
          name: status,
        }
  
        if(status === 'Unread') {
          entry.count = resellers.filter(reseller => reseller.status.toLowerCase() === 'pending' && !reseller.isRead).length;
        
        } else {
          entry.count = resellers.filter(reseller => reseller.status.toLowerCase() === status.toLowerCase()).length;
        }

        this.statuses.push(entry);
      });
    },
    copy(e, item) {
      const el = document.createElement("button");
      el.setAttribute("data-clipboard-text", item.id);
      el.setAttribute("class", "btn");
      new ClipboardJS(".btn");

      document.body.appendChild(el);
      el.click();

      this.$refs.toast.show("success", "Registration ID copied to clipboard");

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  },
  mixins: [mixins],
  computed: {
    items() {
      const resellers = this.$store.getters['distributors/GET_RESELLERS_LIST']; 
      this.computeStatusNumbers(resellers);
      return resellers;
    },
    user() {
      return this.$store.getters["auth/GET_USER"];
    },
    userPlaceholder() {
      return userPlaceholder || "";
    },
    // sortedItems() {
    //   const sorter = (a, b) =>
    //     a.position - b.position || b.createdAt - a.createdAt;

    //   return this.items.sort(sorter);
    // },
  },
  components: {
    Toast
  }
};
</script>