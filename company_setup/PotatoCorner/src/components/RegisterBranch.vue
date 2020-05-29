<template>
  <v-dialog v-model="addBranchDialog" persistent width="800px">
      <v-card>
        <v-card-title class="primary white--text title font-weight-bold">
          REGISTER A BRANCH
          <v-spacer></v-spacer>
          <v-btn icon dark @click="closeBranchDialog">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-container fluid grid-list-md class="pa-4">
          <v-stepper v-model="frame">
            <v-stepper-header>
              <v-stepper-step :complete="frame > 1" step="1"
                >Branch Information</v-stepper-step
              >
              <v-divider></v-divider>

              <v-stepper-step :complete="frame > 2" step="2"
                >Branch Address</v-stepper-step
              >
              <v-divider></v-divider>

              <v-stepper-step :complete="frame > 3" step="3"
                >Branch Account Details</v-stepper-step
              >

            </v-stepper-header>

            <v-stepper-items>
              <v-stepper-content step="1">
                <v-form ref="form1" v-model="form1" @submit.prevent="frame++">
                  <v-layout row wrap>
                    <v-flex xs12>
                      <div class="font-weight-bold text-center">
                        Branch Information
                      </div>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        :rules="basicRules"
                        required
                        label="Branch Name*"
                        v-model="registerData.branchName"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <div class="font-weight-bold">Branch Manager's Full Name</div>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        :rules="basicRules"
                        required
                        label="First Name*"
                        v-model="registerData.firstName"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        label="Middle Initial / Middle Name"
                        v-model="registerData.middleInitial"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        :rules="basicRules"
                        required
                        label="Last Name*"
                        v-model="registerData.lastName"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-menu
                        ref="menu"
                        v-model="menu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        full-width
                        max-width="290px"
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            :value="vDateFormatter(registerData.establishDate)"
                            prepend-inner-icon="event"
                            required
                            readonly
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="registerData.establishDate"
                          @change="menu = false"
                          no-title
                        ></v-date-picker>
                      </v-menu>
                    </v-flex>
                    <v-flex xs12>
                      <v-btn
                        type="submit"
                        color="primary"
                        block
                        depressed
                        :disabled="!form1"
                      >
                        Proceed
                        <v-icon right>arrow_forward</v-icon>
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-stepper-content>

              <v-stepper-content step="2">
                <v-form ref="form2" v-model="form2" @submit.prevent="frame++">
                  <v-layout row wrap>
                    <v-flex xs12>
                      <div class="font-weight-bold text-center">Branch Address</div>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        label="Lot Number / Bldg."
                        v-model="registerData.address.house"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        :rules="basicRules"
                        label="Street Name*"
                        v-model="registerData.address.streetName"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-autocomplete
                        :rules="basicRules"
                        :items="provinces"
                        item-value="name"
                        label="Province*"
                        item-text="name"
                        v-model="registerData.address.province"
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12>
                      <v-autocomplete
                        :rules="basicRules"
                        v-if="registerData.address.province"
                        item-value="name"
                        :items="cities"
                        label="City/Municipality*"
                        item-text="name"
                        v-model="registerData.address.citymun"
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        :rules="basicRules"
                        v-if="registerData.address.citymun"
                        label="Barangay*"
                        v-model="registerData.address.barangay"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        :rules="basicRules"
                        required
                        label="Zip Code*"
                        v-model="registerData.address.zipCode"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
				          <v-btn
                    type="submit"
                    depressed block
                    color="primary"
                    :disabled="!form2"
                  >
                    Proceed
                    <v-icon right>arrow_forward</v-icon>
                  </v-btn>
                  <v-btn depressed block outline @click="frame -= 1">BACK</v-btn>
                </v-form>
              </v-stepper-content>

              <v-stepper-content step="3">
                <v-form
                  v-model="form3"
                  ref="form3"
                  lazy-validation
                  @submit.prevent="registerBranch"
                >
                  <v-layout row wrap>
                    <v-flex xs12>
                      <div class="font-weight-bold text-center">Branch Account Details</div>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        label="Facebook URL/Username*"
                        v-model="registerData.social.facebook"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        :rules="mobileRules"
                        type="number"
                        append-icon="contact_phone"
                        required
                        label="Mobile number*"
                        v-model="registerData.contact"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        :rules="emailRules"
                        append-icon="email"
                        label="Email address*"
                        v-model="registerData.email"
                        type="email"
                        required
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-btn
                        type="submit"
                        color="primary"
                        block
                        depressed
                        :disabled="submitBtnDisabled || !form3"
                        :loading="submitBtnDisabled"
                      >
                        Register Branch
                        <v-icon right>arrow_forward</v-icon>
                      </v-btn>
                    </v-flex>
                    <v-flex xs12>
                      <v-btn block depressed outline @click="frame -= 1">BACK</v-btn>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-container>
      </v-card>
    </v-dialog>
</template>

<script>
import mixins from "@/mixins";
import provinces from "@/assets/provinces.json";
import moment from 'moment';
import axios from 'axios';

export default {
    mixins: [mixins],
    props: ['addBranchDialog'],
	created() {
		this.provinces = provinces;
	},
	data: () => ({
		frame: 1,
		form1: false,
		form2: false,
    form3: false,
    menu: false,
		submitBtnDisabled: false,
		provinces: [],
		cities: [],

    registerData: {
      branchName: null,
      firstName: null,
      middleInitial: null,
      lastName: null,
      email: null,
      contact: null,
      social: {
          facebook: null
      },
      address: {
          house: null,
          streetName: null,
          barangay: null,
          citymun: null,
          province: null,
          zipCode: null,
      },
      status: 'approved',
      type: 'Reseller',
      agentId: null,
    }
  }),
  computed: {
      
  },
  methods: {
    vDateFormatter(date) {
      return date ? moment(date).format('DD-MMM-YYYY') : null;
    },

    closeBranchDialog() {
      this.$emit('closeAddBranchDialog', false);
      this.registerData = {
        branchName: null,
        firstName: null,
        middleInitial: null,
        lastName: null,
        email: null,
        contact: null,
        social: {
            facebook: null
        },
        address: {
          house: null,
          streetName: null,
          barangay: null,
          citymun: null,
          province: null,
          zipCode: null,
        },
        status: 'approved',
        type: 'Reseller',
        agentId: null,
      };
      
      this.frame = 1;
      this.$refs.form1.resetValidation();
      this.$refs.form2.resetValidation();
      this.$refs.form3.resetValidation();
    },

    async registerBranch() {
      const answer = await this.$swal.fire({
        title: "Confirmation!",
        text: "Are you sure you want to register this branch?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        showCloseButton: true
      });

      if(!answer.value) return;
      
      this.submitBtnDisabled = true;
      
      try {
        await this.$store.dispatch('distributors/ADD_BRANCH', this.registerData);
        this.submitBtnDisabled = false;

        this.$swal.fire({
          type: 'success',
          title: 'Success!',
          text: 'The branch was successfully registered!'
        });

        this.closeBranchDialog();
      
      } catch(error) {
        console.log(error);
        this.submitBtnDisabled = false;

        let errorMessage;
        if(error.code === 'auth/email-already-in-use') {
          errorMessage = 'The email address is already in use by another account.';
        
        } else {
          
          await axios({
            method: 'post',
            url: `${process.env.accountManagementURL}/deleteUser`,
            data: {
              email: this.registerData.email
            }
          }); 
          
          errorMessage = 'An error occured during register of the branch. Please try again later.';
        }

        this.$swal.fire({
          type: 'error',
          title: 'An error occurred!',
          text: errorMessage
        });
      }
      
    }
  },

  watch: {
    "registerData.address.province"(val) {
      if(val) {
        this.cities = provinces.filter(p => p.name === val)[0].cities;
      }
    },
  }
}
</script>

<style>

</style>