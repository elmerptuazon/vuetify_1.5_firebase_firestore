<template>
  <v-app id="inspire">
    <v-navigation-drawer
      fixed
      :clipped="$vuetify.breakpoint.lgAndUp"
      app
      v-model="drawer"
    >
      <v-list dense>
        <template v-for="item in GET_TOOLBAR_LINKS">
          <v-list-group
            v-if="item.children"
            v-model="item.model"
            :key="item.text"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon=""
          >
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ item.text }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile
              v-for="(child, i) in item.children"
              :key="i"
              :to="{ name: child.url }"
            >
              <v-list-tile-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ child.text }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>
          <v-list-tile v-else :to="{ name: item.url }" :key="item.text">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ item.text }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      color="primary"
      dark
      app
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      fixed
    >
      <v-toolbar-title style="pointer-events: none;">
        <v-toolbar-side-icon
          @click.stop="drawer = !drawer"
          style="pointer-events: initial !important;"
        ></v-toolbar-side-icon>
        <Logo />
        <span class="hidden-sm-and-down">
          <!-- Ever Bilena Management Website -->
        </span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat @click="myAccount">
          <v-icon left>account_circle</v-icon> My Account
        </v-btn>
      </v-toolbar-items>
      <v-toolbar-items>
        <v-btn flat @click="logout">
          <v-icon left>vpn_key</v-icon> Log Out
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import Logo from "@/components/Logo";

export default {
  name: "default",
  data: () => ({
    dialog: false,
    drawer: null
  }),
  methods: {
    async logout() {
      try {
        await this.$store.dispatch("auth/LOGOUT");
        this.$router.push({ name: "Login" });
      } catch (error) {
        console.log(error);
      }
    },
    async myAccount() {
      try {
        this.$router.push({ name: "MyAccount" });
      } catch (error) {
        console.log(error);
      }
    }
  },
  computed: {
    ...mapGetters(["GET_COMPANIES", "GET_TOOLBAR_LINKS"])
  },
  components: {
    Logo
  }
};
</script>
<style>
  .swal2-container .swal2-popup {
    font-family: 'Roboto', sans-serif;
  }

  .swal2-container .swal2-modal {
    font-family: 'Roboto', sans-serif;
  }

  .swal2-container .swal2-show {
    font-family: 'Roboto', sans-serif;
  }
</style>