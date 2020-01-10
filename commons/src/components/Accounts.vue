<template>
	<div>
		<v-dialog v-model="dialog" max-width="600" persistent>
			<v-card>
				<v-card-title class="secondary white--text">
					<div class="headline">{{companyDetails.name}} Accounts</div>
					<v-spacer></v-spacer>
					<v-btn flat icon @click="dialog = false" dark>
						<v-icon>close</v-icon>
					</v-btn>
				</v-card-title>
				<v-card-text>
					<v-btn @click="newForm = true" color="primary" v-show="!newForm">Add Account</v-btn>

					<v-card v-if="newForm">
						<v-card-text>
							<v-form>
								<v-text-field label="Email Address" append-icon="mail" v-model="email"></v-text-field>
								<v-text-field label="Password" append-icon="lock" type="password" v-model="password"></v-text-field>
							</v-form>
						</v-card-text>
						<v-card-actions>
							<v-spacer></v-spacer>
							<v-btn @click="newForm = false" color="secondary" flat>Close</v-btn>
							<v-btn @click="saveAccount" color="primary" flat>Save</v-btn>
						</v-card-actions>
					</v-card>

					<div class="mt-3"></div>

					<v-card>
						<v-card-title>
							<div class="headline">List of Accounts</div>
						</v-card-title>
						<v-divider></v-divider>
						<v-card-text>
							<v-list>
								<v-list-tile v-for="(a, i) in accounts" :key="i" @click="">
									<v-list-tile-content>
										<v-list-tile-title v-html="a.email"></v-list-tile-title>
									</v-list-tile-content>
								</v-list-tile>
							</v-list>
						</v-card-text>
					</v-card>
				</v-card-text>
			</v-card>
		</v-dialog>
		<Toast ref="toast" />
	</div>
</template>

<script>
import Toast from './Toast';
import axios from 'axios';

export default {
	components: { Toast },
	data: () => ({
		accounts: [],
		dialog: false,
		companyDetails: {
			name: null,
			id: null
		},
		newForm: false,
		email: null,
		password: null
	}),
	methods: {
		async show (item) {
			try {
				this.companyDetails = item;

				const accounts = await this.$store.dispatch('auth/GET_ACCOUNTS_BY_COMPANY', item.id);
				console.log(accounts);
				this.accounts = accounts;
				this.dialog = true;
			} catch (error) {
				console.log(error);
			}
		},
		async saveAccount () {
			try {
				const doc = await this.$store.dispatch('auth/ADD_ACCOUNT', {
					email: this.email,
					password: this.password,
					companyId: this.companyDetails.id
				});
				this.$refs.toast.show('success', 'Account has been successfully created');
				this.email = null;
				this.password = null;
				this.newForm = false;
				this.accounts.push(doc);
			} catch (error) {
				console.log(error);
				if (error.code === 'auth/argument-error') {
					this.$refs.toast.show('error', 'All fields are required');
				} else {
					this.$refs.toast.show('error', error.message);
				}
			}
		}
	}
}
</script>
