<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <v-layout row wrap align-center justify-start>
          <v-flex xs3>
            <div class="headline">Branch Accounts</div>
          </v-flex>

          <v-flex xs4>
            <v-text-field
              append-icon="search"
              label="Search branch..."
              single-line
              hide-details
              v-model="search"
            ></v-text-field>
          </v-flex>

          <v-flex xs2 ml-4>
            <v-btn dark color="primary" @click="addBranch">
              <v-icon class="mr-2">add</v-icon>
              ADD A BRANCH
            </v-btn>
          </v-flex>

          <v-flex xs2 ml-2>
            <v-btn dark color="primary" @click="openExcelDialog">
              <v-icon class="mr-2">insert_drive_file</v-icon>
              UPLOAD EXCEL FILE
            </v-btn>
          </v-flex>
        </v-layout>
        
      </v-card-title>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="items"
        item-key="id"
        class="elevation-1"
        :loading="loading"
        :search="search"
        :rows-per-page-items="rowsPerPageItems"
      >
        <template slot="items" slot-scope="props">
          <tr @click="viewUser(props.item)">
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
            <td class="text-xs-left">{{ props.item.agentId }}</td>
            <td class="text-xs-left">{{ props.item.branchName }}</td>
            <td class="text-xs-left">{{ props.item.firstName }} {{ props.item.middleInitial }} {{ props.item.lastName }}</td>
            <!-- <td class="text-xs-center">{{ props.item.firstName }}</td>
            <td class="text-xs-center">{{ props.item.middleInitial }}</td>
            <td class="text-xs-center">{{ props.item.lastName }}</td> -->
            <!-- <td class="text-xs-center">{{ props.item.birthday }}</td>
            <td class="text-xs-center">{{ props.item.gender }}</td> -->
            <td class="text-xs-left">{{ props.item.email }}</td>
            <td class="text-xs-left">{{ props.item.contact }}</td>
            <td class="text-xs-left">{{ showFullAddress(props.item.address) }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import mixins from "@/mixins";
import { DB } from "@/config/firebase";
// import userPlaceholder from "@/assets/placeholder.png";
import userPlaceholder from "@/assets/DefaultBranchPic.png";

const usersCollection = DB.collection("accounts");

export default {
  data: () => ({
    items: [],
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
        text: "Branch ID",
        value: "agentId"
      },
      {
        text: "Branch Name",
        value: "branchName"
      },
      {
        text: "Branch Manager Name",
        value: "lastName"
      },
      // {
      //   text: "First name",
      //   value: "firstName"
      // },
      // {
      //   text: "Middle initial",
      //   value: "middleInitial"
      // },
      // {
      //   text: "Last name",
      //   value: "lastName"
      // },
      // {
      //   text: "Birthday",
      //   value: "birthday"
      // },
      // {
      //   text: "Gender",
      //   value: "gender"
      // },
      {
        text: "Email",
        value: "email"
      },
      {
        text: "Contact",
        value: "contact"
      },
      {
        text: "Address",
        value: "address.home"
      }
    ],
    userPlaceholder: userPlaceholder,
    loading: false
  }),
  created() {
    this.fetchUsers();
  },
  methods: {
    showFullAddress(address) {
      const { house, streetName, barangay, citymun, province, zipCode } = address; 
      return `${house}, ${streetName}, ${barangay}, ${province}, ${zipCode}`;
    },

    viewUser(account) {
      this.$router.push({
        name: "RegistrationDetails",
        params: { uid: account.id, account }
      });
    },

    async fetchUsers() {
      this.loading = true;

      try {
        const querySnapshot = await usersCollection
          .where("type", "==", "Reseller")
          .where("status", "==", "approved")
          .get();

        this.items = querySnapshot.docs.map(doc => {
          const user = doc.data();
          user.id = doc.id;
          return user;
        });

        console.log("Resellers", this.items);
      } catch (error) {
        console.log(error);
      }

      this.loading = false;
    }
  },
  mixins: [mixins]
};
</script>