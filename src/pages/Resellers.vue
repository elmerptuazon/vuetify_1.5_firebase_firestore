<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <div class="headline">Reseller Accounts</div>
        <v-spacer></v-spacer>
        <v-text-field
          append-icon="search"
          label="Search reseller..."
          single-line
          hide-details
          v-model="search"
        ></v-text-field>
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
            <td class="text-xs-center">{{ props.item.agentId }}</td>
            <td class="text-xs-center">{{ props.item.firstName }}</td>
            <td class="text-xs-center">{{ props.item.middleInitial }}</td>
            <td class="text-xs-center">{{ props.item.lastName }}</td>
            <td class="text-xs-center">{{ props.item.birthday }}</td>
            <td class="text-xs-center">{{ props.item.gender }}</td>
            <td class="text-xs-center">{{ props.item.email }}</td>
            <td class="text-xs-center">{{ props.item.contact }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import mixins from "@/mixins";
import { DB } from "@/config/firebase";
import userPlaceholder from "@/assets/placeholder.png";
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
        text: "ID",
        value: "agentId"
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
      }
    ],
    userPlaceholder: userPlaceholder,
    loading: false
  }),
  created() {
    this.fetchUsers();
  },
  methods: {
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