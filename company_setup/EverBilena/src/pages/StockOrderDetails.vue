<template>
	<v-container>
		<v-card>
			<v-card-title>
				<v-btn icon @click="$router.go(-1)">
					<v-icon>arrow_back</v-icon>
				</v-btn>
				<div class="headline">Stock Orders</div>
				<v-spacer></v-spacer>
				<v-avatar v-if="item.user.downloadURL" size="40">
					<v-img :src="item.user.downloadURL"></v-img>
				</v-avatar>
				<v-avatar v-else size="40">
					<v-img :src="userPlaceholder"></v-img>
				</v-avatar>
			</v-card-title>
			<v-divider></v-divider>
			<v-card-text>
				<v-layout row wrap>
					<v-flex xs12 s12 md8 lg8 xl8></v-flex>
					<v-flex xs12 s12 md4 lg4 xl4>
						<v-select :items="status" v-model="selectedStatus" label="Update Status"></v-select>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs4>
						<div class="text-xs-center">
							<strong>
								{{ item.user.agentId }} - {{ item.user.firstName }} {{ item.user.middleInitial || '' }} {{ item.user.lastName }}, {{ item.user.address.citymun }}
							</strong>
						</div>
					</v-flex>
					<v-flex xs4>
						<div class="text-xs-center">
							<strong>
								Order Date: {{ item.submittedAt | momentize('DD-MMM-YYYY') }}
							</strong>
						</div>
					</v-flex>
					<v-flex xs4>
						<div class="text-xs-center">
							<strong>
								Status: <span class="primary--text">{{ item.status | uppercase }}</span>
							</strong>
						</div>
					</v-flex>
				</v-layout>
				<div class="mb-2"></div>
				<StockOrderItems :items="item.items"  :loading="loading" />
			</v-card-text>
			<v-divider></v-divider>
			<!-- <v-card-actions v-if="item.status === 'pending'">
				<v-spacer></v-spacer>
				<v-btn color="green" dark large @click="updateStatus('delivered')">DELIVERED</v-btn>
				<v-btn color="green" outline dark large @click="updateStatus('collected')">COLLECTED</v-btn>
			</v-card-actions> -->
		</v-card>

		<Toast ref="toast" />
	</v-container>
</template>

<script>
import mixins from '@/mixins';
import {DB} from '@/config/firebase';
import userPlaceholder from '@/assets/placeholder.png';
import AccountData from '@/components/AccountData';
import Toast from '@/components/Toast';
import StockOrderItems from '@/components/StockOrderItems';

export default {
	data: () => ({
		loading: false,
		item: {},
		status: ['Processing', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
		selectedStatus: null
	}),
	async created () {
		this.loading = true;
		try {
			const { id, item } = this.$route.params;

			if (id) {
				this.item = item;
				const items = [];
				for (const product of item.items) {
					const data = (await DB.collection('products').doc(product.productId).get()).data();
					product.downloadURL = data.downloadURL;
					product.name = data.name;
					items.push(product);
				}
				this.item.items = items;
			} else {
				this.$router.push({ name: 'StockOrders' });
			}

		} catch (error) {
			this.$refs.toast.show('error', 'An error occurred');
			console.log(error);
		}
		this.loading = false;
	},
	methods: {
		async updateStatus(status) {
			try {

				if (this.item.statusTimeline) {
					this.item.statusTimeline.push({
						status: status,
						date: Date.now()
					});
				} else {
					this.item.statusTimeline = [{ status: status, date: Date.now() }];
				}

				await this.$store.dispatch('stock_orders/UPDATE_STATUS', {
					status: status,
					statusTimeline: this.item.statusTimeline,
					id: this.$route.params.id
				});

				this.item.status = status;
				this.$refs.toast.show('success', 'Order has been successfully marked as ' + status);
			} catch (error) {
				this.$refs.toast.show('error', 'An error occurred');
				console.log(error);
			}
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
		StockOrderItems
	},
	watch: {
		selectedStatus (val) {
			this.updateStatus(val.toLowerCase());
		}
	}
}
</script>
</template>
