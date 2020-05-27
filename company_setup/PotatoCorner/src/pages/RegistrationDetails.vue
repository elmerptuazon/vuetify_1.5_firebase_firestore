<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-btn icon @click="$router.go(-1)">
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <div class="headline">Branch Details</div>
        <v-spacer></v-spacer>
        <v-avatar v-if="account.downloadURL" size="40">
          <v-img :src="account.downloadURL"></v-img>
        </v-avatar>
        <v-avatar v-else size="40">
          <v-img :src="userPlaceholder"></v-img>
        </v-avatar>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-layout row wrap>
          <v-flex xs4>
            <div class="text-xs-left ml-3 subheading">
              <strong>
                Application Date:
                {{ account.createdAt | momentize("DD-MMM-YYYY") }}
              </strong>
            </div>
          </v-flex>
          <!-- <v-flex xs4>
            <div class="text-xs-center">
              <strong v-if="account.status === 'pending'">
                Status: <span class="primary--text">PENDING</span>
              </strong>
              <strong v-if="account.status === 'approved'">
                Status: <span class="green--text">APPROVED</span>
              </strong>
              <strong v-else-if="account.status === 'denied'">
                Status: <span class="red--text">DENIED</span>
              </strong>
            </div>
          </v-flex> -->
        </v-layout>
        <div class="mb-2"></div>
        <v-form v-model="valid" ref="form">
          <AccountData ref="form" :account="account" />
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <!-- <v-card-actions v-if="account.status !== 'approved'">
        <v-spacer></v-spacer>
        <v-btn color="green" dark large @click="approve">APPROVE</v-btn>
        <v-btn color="red" dark large @click.stop="openRemarksModal"
          >DENY</v-btn
        >
      </v-card-actions> -->
    </v-card>

    <v-dialog max-width="400" v-model="remarksModal" persistent>
      <v-card>
        <v-card-title>
          <div class="headline">Remarks</div>
          <v-spacer></v-spacer>
          <v-btn flat icon @click="remarksModal = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="py-0">
          <v-textarea
            v-model="remarks"
            label="Enter message here..."
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deny" color="red" dark>Deny</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <Modal ref="modal" />
    <Toast ref="toast" />
  </v-container>
</template>

<script>
import mixins from '@/mixins';
import {DB} from '@/config/firebase';
import userPlaceholder from '@/assets/placeholder.png';
import AccountData from '@/components/AccountData';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';
export default {
	data: () => ({
		account: {},
		remarksModal: false,
		remarks: null,
		valid: false
	}),
	async created () {
		this.loading = true;
		try {
			const { uid, account } = this.$route.params;

			if (!uid && !account) {
				this.$router.push({ name: 'NewRegistrations' });
				return;
			}

			if (!account) {
				this.account = await this.$store.dispatch('auth/GET_USER', uid);
			} else {
				this.account = account;
			}

			if (!this.account.isRead || !account.isRead) {
				this.account.isRead = true;
				await this.$store.dispatch('distributors/UPDATE_STATUS_BY_FIELD', {
					uid: uid,
					key: 'isRead',
					value: true,
				});
			}

			console.log(this.account);
		} catch (error) {
			this.$refs.toast.show('error', 'An error occurred');
			console.log(error);
		}
	},
	methods: {
		async approve () {
			try {
				

				if (!this.$refs.form.validate()) {
					this.$refs.modal.show('Sorry', 'One or more mandatory fields are required');
					return;
				}

				if (!this.account.agentId) {
					this.$refs.toast.show('error', 'Membership ID is required');
					return;
				}

				await this.$store.dispatch('distributors/UPDATE_STATUS', {
					status: 'approved',
					agentId: this.account.agentId,
					uid: this.account.id,
					// hasNoOrders: true //marks that a reseller is not yet making any others
				});
				this.account.status = 'approved';
				this.$refs.toast.show('success', 'Registration has been successfully approved');
			} catch (error) {
				this.$refs.toast.show('error', 'An error occurred');
				console.log(error);
			}
		},

		async deny () {
			try {

				if (!this.remarks) {
					this.$refs.toast.show('error', 'Remarks is required');
					return;
				}

				await this.$store.dispatch('distributors/UPDATE_STATUS', {
					status: 'denied',
					agentId: this.account.agentId,
					uid: this.account.id,
					remarks: this.remarks
				});
				this.account.status = 'denied';
				this.remarks = null;
				this.remarksModal = false;
				this.$refs.toast.show('success', 'Registration has been succesfully denied.');
			} catch (error) {
				this.$refs.toast.show('error', 'An error occurred');
				console.log(error);
			}
		},

		openRemarksModal () {
			this.remarksModal = true;
		}
	},
	mixins: [mixins],
	computed: {
		userPlaceholder () {
			return userPlaceholder;
		}
	},
	components: {
		AccountData,
		Toast,
		Modal
	}
}
</script>
</template>
