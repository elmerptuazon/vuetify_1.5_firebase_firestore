<template>
	<v-container>
		<v-card>
			<v-card-title>
				<div class="headline">Transactions</div>
				<v-spacer></v-spacer>
				<v-text-field
				append-icon="search"
				label="Search transaction..."
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
				<tr :active="props.selected" @click="props.selected = !props.selected">
					<td class="text-xs-center">
						{{ props.item.id }}
					</td>
					<td class="text-xs-center">
						{{ props.item.datePlaced | momentize('MMMM D, YYYY') }}
					</td>
					<td class="text-xs-center">
						{{ props.item.resellerData.agentId }}
					</td>
					<td class="text-xs-center">
						{{ props.item.totalProducts }}
					</td>
					<td class="text-xs-center">
						{{ props.item.totalProductsPrice | currency('P') }}
					</td>
					<td class="text-xs-center">
						{{ props.item.discount }}
					</td>
					<td class="text-xs-center">
						{{ props.item.deliveryCharge }}
					</td>
					<td class="text-xs-center">
						{{ props.item.totalPrice | currency('P') }}
					</td>
				</tr>
			</template>
		</v-data-table>
	</v-card>
</v-container>
</template>

<script>
import mixins from '@/mixins';
import {DB} from '@/config/firebase';
const usersCollection = DB.collection('accounts');
const ordersCollection = DB.collection('orders');

export default {
	data: () => ({
		items: [],
		loading: false,
		search: null,
		rowsPerPageItems: [10,20,30,{"text":"All","value":-1}],
		selected: [],
		headers: [
		{
			text: 'Order ID',
			value: 'id'
		},
		{
			text: 'Date placed',
			value: 'datePlaced'
		},
		{
			text: 'Reseller ID',
			value: 'resellerData.agentId'
		},
		{
			text: 'No. of products',
			value: 'totalProducts'
		},
		{
			text: 'Total products price',
			value: 'totalProductsPrice'
		},
		{
			text: 'Discount',
			value: 'discount'
		},
		{
			text: 'Delivery charge',
			value: 'deliveryCharge'
		},
		{
			text: 'Total Price',
			value: 'totalPrice'
		}
		]
	}),
	created () {
		this.fetchOrders();
	},
	methods: {
		queryOrders () {
			return new Promise((resolve, reject) => {
				ordersCollection.get().then(querySnapshot => {

					let orders = querySnapshot.docs.map(doc => {
						const order = doc.data();
						order.id = doc.id;

						const totalProducts = order.basket.reduce((a, b) => +a + +b.attribute.qty, 0);
						const totalProductsPrice = order.basket.reduce((a, b) => +a + (+b.attribute.qty * +b.product.price), 0);
						const deliveryCharge = order.delivery_charge ? order.delivery_charge : 0;
						let discount = 0;
						let totalPrice = 0;
						let resellerId;
						let customerId;

						if (order.discount) {
							if (order.discount.type == 'percentage') {
								discount = order.discount.value + '%';

								const _discount = (+order.discount.value / 100) * totalProductsPrice;
								totalPrice = +totalProductsPrice - +_discount;

							} else {
								discount = order.discount.value;
								totalPrice = +totalProductsPrice - +order.discount.value;
							}
						} else {
							totalPrice = totalProductsPrice;
						}

						if (order.uid) {

							if (order.offlineContact) {
								resellerId = order.uid;
								customerId = 'Offline';
							} else {
								resellerId = order.resellerId
							}

							customerId = order.uid;

						}

						if (order.deliveryCharge) {
							totalPrice -= +order.deliveryCharge;
						}

						const item = {
							id: order.id,
							datePlaced: order.created_at,
							resellerId,
							customerId,
							totalProducts,
							totalProductsPrice,
							discount,
							deliveryCharge,
							totalPrice
						}

						return item;
					});

					resolve(orders)
				});
			})
		},
		fetchOrders () {
			this.loading = true;

			this.queryOrders()
			.then((response) => {

				const orders = [];

				response.forEach(order => {
					if (order.resellerId) {
						orders.push(
							usersCollection.doc(order.resellerId).get()
							.then(doc => {

								if (doc.exists) {
									order.resellerData = doc.data();
								}

								return order;
							})
							);
					} else {
						return order;
					}
				});

				return Promise.all(orders)
			})
			.then(data => {
				this.items.length = 0;
				this.loading = false;
				this.items = data;
			});
		},
	},
	mixins: [mixins]
}
</script>
