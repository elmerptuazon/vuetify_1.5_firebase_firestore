<template>
  <v-container>
    <v-layout align-content-center justify-center>
      <v-flex xs12 md6>
        <v-card color="white" class="">
          <v-card-title primary-title>
            <div>
              <div class="headline">My Account</div>
            </div>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <div class="subheading pb-3 font-weight-medium font-italic">
              Account Details
            </div>
            <v-text-field
              readonly
              v-model="user.email"
              label="Email"
            ></v-text-field>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-text>
            <div class="subheading pb-3 font-weight-medium font-italic">
              Security
            </div>
            <v-form ref="form">
              <v-text-field
                v-model="passwords.oldPassword"
                label="Old Password"
                :rules="passwordRules"
                :append-icon="showOldPassward ? 'visibility' : 'visibility_off'"
                :type="showOldPassward ? 'text' : 'password'"
                @click:append="showOldPassward = !showOldPassward"
              ></v-text-field>
              <v-text-field
                v-model="passwords.newPassword"
                label="New Password"
                :rules="basicRules"
                :append-icon="showNewPassward ? 'visibility' : 'visibility_off'"
                :type="showNewPassward ? 'text' : 'password'"
                @click:append="showNewPassward = !showNewPassward"
              ></v-text-field>
              <v-text-field
                v-model="passwords.confirmPassword"
                label="Confirm Password"
                :rules="basicRules"
                :append-icon="
                  showConfirmPassward ? 'visibility' : 'visibility_off'
                "
                :type="showConfirmPassward ? 'text' : 'password'"
                @click:append="showConfirmPassward = !showConfirmPassward"
              ></v-text-field>
              <v-btn
                @click="changePassword"
                :loading="loading"
                :disabled="loading"
                >Change Password</v-btn
              >
            </v-form>
          </v-card-text>

          <!-- <v-card-actions>
            <v-btn flat dark>Listen now</v-btn>
          </v-card-actions> -->
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import mixins from "@/mixins";
export default {
  data: () => ({
    showOldPassward: false,
    showNewPassward: false,
    showConfirmPassward: false,
    passwords: {},
    loading: false
  }),
  methods: {
    async changePassword() {
      if (!this.$refs.form.validate()) {
        this.$swal.fire({
          type: "error",
          title: "Saving failed!",
          text: "One or more fields are incorrect"
        });
        return;
      }
      if (this.passwords.confirmPassword != this.passwords.newPassword) {
        this.$swal.fire({
          type: "error",
          title: "Saving failed!",
          text: "Passwords does not match!"
        });
        return;
      }

      try {
        this.loading = true;
        const result = await this.$store.dispatch(
          "auth/UPDATE_PASSWORD",
          this.passwords
        );

        if (result) {
          this.$swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            type: "success",
            title: "Success!",
            text: "Changing Password Complete! please log-in again!"
          });

          await this.$store.dispatch("auth/LOGOUT");
          this.$router.push({ name: "Login" });
        }
      } catch (error) {
        console.log(error);
        this.$swal.fire({
          type: "error",
          title: "Error!",
          text: "Changing Password failed!"
        });
      } finally {
        this.loading = false;
      }
    }
  },
  computed: {
    ...mapState("auth", {
      user: state => state.user
    })
  },
  mixins: [mixins]
};
</script>

<style lang="scss" scoped>
</style>