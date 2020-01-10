<template>
	<v-container fluid>
		<v-card>
			<v-card-title>
				<div class="headline">Products Ordered</div>
				<v-spacer></v-spacer>
				<v-text-field
				append-icon="search"
				label="Search product..."
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
			<tr>
				<td>
					{{ props.item.item.product.code }}
				</td>
				<td>
					{{ props.item.item.product.name }}
				</td>
				<td>
					{{ props.item.item.attribute.size }}
				</td>
				<td>
					{{ props.item.item.attribute.color }}
				</td>
				<td>
					{{ props.item.item.product.price | currency('P') }}
				</td>
				<td>
					{{ props.item.orderId }}
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
				text: 'Code',
				value: 'item.product.code'
			},
			{
				text: 'Name',
				value: 'item.product.name'
			},
			{
				text: 'Size',
				value: 'item.attribute.size'
			},
			{
				text: 'Color',
				value: 'item.attribute.color'
			},
			{
				text: 'Price',
				value: 'item.product.price'
			},
			{
				text: 'Order ID',
				value: 'orderId'
			}
		]
	}),
	created () {
		this.fetchOrders();
	},
	methods: {
		async fetchOrders () {
			this.loading = true;

			try {

				const querySnapshot = await ordersCollection.get();

				const orders = [];

				querySnapshot.docs.forEach((doc, index) => {
					const orderData = doc.data();
					const orderId = doc.id;

					orderData.basket.forEach(b => {
						for (let x = 0; x < b.attribute.qty; x++) {
							orders.push({
								id: `${orderId}_${x}`,
								orderId,
								item: b
							});
						}
					});
				});

				this.items = orders;

			} catch (error) {
				console.log(error);
			}

			this.loading = false;
		}
	},
	mixins: [mixins]
}
</script>
