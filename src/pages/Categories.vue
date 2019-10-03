<template>
  <v-container fluid>
    <Categories
      :items="items"
      ref="categoriesRef"
      @deleteCategories="deleteCategories"
    />
    <sweet-modal :icon="modal.icon" ref="modal" blocking>
      {{ modal.text }}
    </sweet-modal>
  </v-container>
</template>

<script>
import mixins from "@/mixins";
import { DB, STORAGE } from "@/config/firebase";
import Categories from "@/components/Categories";
import { mapState } from "vuex";
const companiesCollection = DB.collection("companies");
const categoriesCollection = DB.collection("catalogues");
const productsCollection = DB.collection("products");
const storageRef = STORAGE.ref("appsell");

export default {
  data: () => ({
    //items: [],
    loading: false,
    search: null,
    showEdit: false,
    modal: {
      icon: null,
      text: null
    },
    saveButtonDisabled: false
  }),
  async created() {
    try {
      // const items = await this.$store.dispatch("categories/GET_CATEGORIES");
      // this.items = items;
      await this.$store.dispatch("categories/FETCH_CATEGORIES");
    } catch (error) {
      console.log(error);
    }
    //this.$refs.categoriesRef.loading = false;
    console.log(this.user);
    if (!this.user.hasSignedIn) {
      const passwordDialog = await this.$swal.mixin({
        type: "info",
        input: "password",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCancelButton: true,
        inputPlaceholder: "Enter password",
        inputValidator: value => {
          if (!value) {
            return "You need to input something!";
          } else if (value.length < 6) {
            return "password must be longer than 6 characters";
          }
        },
        inputAttributes: {
          minlength: 6,
          autocapitalize: "off",
          autocorrect: "off"
        },
        progressSteps: ["1", "2"]
      });
      const password = await passwordDialog.queue([
        {
          title: "Password Update",
          text:
            "It seems that you are new to this site, we would require you to change your password before you can continue. Please input your Current Password"
        },
        {
          title: "Password Update",
          text: "Please input your New Password",
          showLoaderOnConfirm: true
        }
      ]);

      console.log(password);
      if (password.value) {
        this.$swal.fire({
          title: "Processing Please Wait!",
          onBeforeOpen: () => {
            this.$swal.showLoading();
          }
        });
        try {
          const passwords = {
            oldPassword: password.value[0],
            newPassword: password.value[1]
          };
          const result = await this.$store.dispatch(
            "auth/UPDATE_PASSWORD",
            passwords
          );
          const userData = {
            hasSignedIn: true
          };
          //userData.oldPassword = passwords.oldPassword;
          await this.$store.dispatch("auth/UPDATE_USER", userData);

          if (result) {
            this.$swal.fire({
              allowOutsideClick: false,
              allowEscapeKey: false,
              type: "success",
              title: "Success!",
              text: "Changing Password Complete! please log-in again!"
            });
          }
        } catch (error) {
          console.log(error);
          this.$swal.fire({
            type: "error",
            title: "Error!",
            text: "Changing Password failed!"
          });
        } finally {
          await this.$store.dispatch("auth/LOGOUT");
          this.$router.push({ name: "Login" });
        }
      } else if (password.dismiss === this.$swal.DismissReason.cancel) {
        try {
          await this.$store.dispatch("auth/LOGOUT");
          //this.$router.push({ name: "Login" });
        } catch (error) {
          this.$swal.fire({
            type: "error",
            title: "Error!",
            text: "Error logging out!"
          });
          console.log(error);
        } finally {
          this.$router.push({ name: "Login" });
        }
      }
    }
  },
  methods: {
    notify(icon, text) {
      this.modal.icon = icon;
      this.modal.text = text;
      this.$refs.modal.open();
    },
    async deleteCategories() {
      const c = confirm("Are you sure?");

      if (!c) {
        return;
      }

      try {
        const items = this.$refs.categoriesRef.selected;

        this.notify("warning", "Batch delete in progress. Please dont close");

        console.log("removing products in categories...");

        // Remove products for each category
        for (const item of items) {
          const querySnapshot = await productsCollection
            .where("categoryId", "==", item.id)
            .get();
          const products = querySnapshot.docs.map(doc => {
            const data = doc.data();
            data.id = doc.id;
            return data;
          });

          for (const product of products) {
            try {
              await productsCollection.doc(product.id).delete();
              await STORAGE.refFromURL(product.downloadURL).delete();
            } catch (error) {
              continue;
            }
          }
        }

        console.log("removing categories...");

        // Remove categories
        for (const item of items) {
          try {
            await categoriesCollection.doc(item.id).delete();
            await STORAGE.refFromURL(item.downloadURL).delete();
            const index = this.items.findIndex(i => i.id === item.id);
            if (index !== -1) {
              this.items.splice(index, 1);
            }
          } catch (error) {
            continue;
          }
        }

        this.notify("success", "All categories has been successfully removed");
      } catch (error) {
        console.log(error);
        this.notify("error", "An error occurred");
      }
    }
  },
  components: {
    Categories
  },
  computed: {
    ...mapState("auth", {
      user: state => state.user
    }),

    ...mapState("categories", {
      items: state => state.categoryList
    })
  },
  mixins: [mixins]
};
</script>
