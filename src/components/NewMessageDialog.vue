<template>
	<v-dialog v-model="dialog" width="500">
		<v-card>
			<v-card-title primary-title class="headline">
				New Message
			</v-card-title>
			<v-divider></v-divider>
			<v-card-text>
				<v-form>
					<v-layout row wrap>
						<v-flex xs12>
							<v-autocomplete return-object v-model="selectedDistributor" :items="items" label="Type the name of a person" item-text="fullName"></v-autocomplete>
						</v-flex>
						<v-flex xs12>
							<v-textarea v-model="text" placeholder="Type a message..." box></v-textarea>
						</v-flex>
					</v-layout>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn flat @click="dialog = false">Close</v-btn>
				<v-btn flat :loading="loading" :disabled="loading" @click="send" class="primary white--text">Send</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	data: () => ({
		dialog: false,
		items: [],
		selectedDistributor: {},
		text: null,
		loading: false
	}),
	async created () {
		try {} catch (error) {}
	},
	methods: {
		async open () {
			try {
				const data = await this.findDistributors();
				this.items = data.map((account) => {
					account.fullName = `${account.firstName} ${account.middleInitial || ''} ${account.lastName}`;
					return account;
				});
				this.dialog = true;
			} catch (error) {
				console.log(error);
			}
		},
		async findDistributors () {
			try {
				const response = await this.$store.dispatch('distributors/FIND');
				return response;
			} catch (error) {
				throw error;
			}
		},
		async send () {
			if (!this.text || !this.selectedDistributor.id) {
				return;
			}

			this.loading = true;

			try {
				const id = this.selectedDistributor.id;
				const data = await this.$store.dispatch('conversations/CHECK_IF_EXISTS', id);

				if (data.length > 0) {
					const conversation = data[0];

					const messageData = {
						conversationId: conversation.id,
						text: this.text,
						distributorId: id
					};

					await this.$store.dispatch('conversations/SEND_MESSAGE', messageData);
					this.$emit('viewConversation', conversation.id);
				} else {
					try {
						const res = await this.$store.dispatch('conversations/ADD_CONVERSATION', {
							distributorId: id,
							sendMessage: true
						});

						const messageData = {
							conversationId: res.id,
							text: this.text,
							distributorId: id
						};

						await this.$store.dispatch('conversations/SEND_MESSAGE', messageData);
						this.$emit('viewConversation', res.id);
					} catch (error) {
						console.log(error);
					}
				}

				this.text = null;
				this.selectedDistributor = {};
				this.dialog = false;
			} catch (error) {
				console.log(error);
			}

			this.loading = false;
		}
	},
	watch: {
		selectedDistributor (val) {
			console.log(val);
		}
	}
}
</script>
