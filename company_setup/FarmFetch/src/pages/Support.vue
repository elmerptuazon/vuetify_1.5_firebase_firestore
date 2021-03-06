<template>
	<v-container>
		<v-card>
			<v-card-title>
				<div class="headline">Support</div>
				<v-spacer></v-spacer>
			</v-card-title>
			<v-divider></v-divider>
			<div class="text-xs-center mt-3">
				<v-progress-circular :size="150" :width="5" color="primary" indeterminate v-if="loading"></v-progress-circular>
			</div>
			<v-list two-line>
				<template v-for="(item, index) in items">
					<v-divider v-if="item.divider" :inset="item.inset" :key="index"></v-divider>

					<v-list-tile v-else :key="item.title" avatar @click="viewMessage(item)" ripple :class="[!item.opened ? 'grey lighten-1' : '']">
						<v-list-tile-avatar>
							<img :src="item.user.downloadURL" v-if="item.user.hasPicture" />
							<img :src="userPlaceholder" alt="userPlaceholder" v-else />
						</v-list-tile-avatar>

						<v-list-tile-content>
							<v-list-tile-title>
								{{ item.user.firstName }} {{ item.user.middleInitial || '' }} {{ item.user.lastName }}
							</v-list-tile-title>
							<v-list-tile-sub-title>
								<span class="text--primary">{{ item.createdAt | momentize('MMMM D, YYYY h:mm a') }}</span> &mdash; {{ item.message }}
							</v-list-tile-sub-title>
						</v-list-tile-content>
					</v-list-tile>
				</template>
			</v-list>
		</v-card>

		<v-dialog v-model="dialog" persistent max-width="700">
			<v-card>
				<v-card-title primary-title>
					<div class="headline">
						{{ selectedMessage.name }}
					</div>
					<v-spacer></v-spacer>
					<v-btn icon flat @click="dialog = false">
						<v-icon>close</v-icon>
					</v-btn>
				</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					<div>
						<strong>Date:</strong> {{ selectedMessage.created | momentize('MMMM D, YYYY, h:mm A') }}
					</div>
					<div v-if="selectedMessage.email">
						<strong>Email Address:</strong> {{ selectedMessage.email }}
					</div>
					<div v-if="selectedMessage.contact">
						<strong>Contact:</strong> {{ selectedMessage.contact }}
					</div>
					<div class="mt-3"></div>
					<p class="text-xs-justify">{{ selectedMessage.message }}</p>
				</v-card-text>
			</v-card>
		</v-dialog>
	</v-container>
</template>

<script>
import mixins from '@/mixins';
import { DB } from '@/config/firebase';
import userPlaceholder from '@/assets/placeholder.png';

const supportCollection = DB.collection('support');
const usersCollection = DB.collection('accounts');

export default {
	data () {
		return {
			// items: [],
			userPlaceholder: null,
			loading: false,
			dialog: false,
			selectedMessage: {
				name: null,
				email: null,
				contact: null,
				created: null,
				avatar: null,
				message: null
			}
		}
	},
	methods: {
		async findUser (uid) {
			try {
				const doc = await usersCollection.doc(uid).get();
				return doc.data();
			} catch (error) {
				throw error;
				console.log(error);
			}
		},
		async viewMessage (item) {
			try {

				const {
					firstName,
					middleInitial,
					lastName,
					email,
					contact,
					created,
					downloadURL,
					isEmailAutogenerated
				} = item.user;

				this.selectedMessage = {
					name: `${firstName} ${middleInitial || ''} ${lastName}`,
					email: isEmailAutogenerated ? null : email,
					contact: contact,
					created: created,
					avatar: downloadURL ? downloadURL : userPlaceholder,
					message: item.message
				};

				this.dialog = true;

				if (!item.opened) {
					await this.$store.dispatch('support/MARK_AS_READ', item.id);
				}

			} catch (error) {
				console.log(error);
			}
		}
	},
	mounted () {
		this.userPlaceholder = userPlaceholder;
	},
	mixins: [mixins],
	computed: {
		items() {
			return this.$store.getters['support/GET_ALL_MESSAGES'];
		}
	}
}
</script>
