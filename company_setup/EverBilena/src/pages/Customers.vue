<template>
	<v-container fluid>
		<v-card>
			<v-card-title>
				<div class="headline">Customer Accounts</div>
				<v-spacer></v-spacer>
				<v-text-field
				append-icon="search"
				label="Search customer..."
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
						<td class="text-xs-center pa-2">
							<v-avatar size="80px" tile v-if="props.item.downloadURL">
								<img
								:src="props.item.downloadURL"
								:alt="props.item.firstName">
							</v-avatar>
							<img :src="userPlaceholder" alt="no_image" v-else style="width: 50%;">
						</td>
						<td class="text-xs-center">
							<span v-if="props.item.resellerData">
								{{ props.item.resellerData.agentId }}
							</span>
							<span v-else>
								No reseller
							</span>
						</td>
						<td class="text-xs-center">{{ props.item.firstName }}</td>
						<td class="text-xs-center">{{ props.item.middleInitial }}</td>
						<td class="text-xs-center">{{ props.item.lastName }}</td>
						<td class="text-xs-center">{{ props.item.birthday }}</td>
						<td class="text-xs-center">{{ props.item.gender }}</td>
						<td class="text-xs-center">{{ props.item.email }}</td>
						<td class="text-xs-center">{{ props.item.contact }}</td>
					</tr>
				</template>
			</v-data-table>
		</v-card>
	</v-container>
</template>

<script>
import mixins from '@/mixins';
import { DB } from '@/config/firebase';
import userPlaceholder from '@/assets/placeholder.png';
const usersCollection = DB.collection('accounts');

export default {
	data: () => ({
		items: [],
		loading: false,
		search: null,
		rowsPerPageItems: [10,20,30,{"text":"All","value":-1}],
		selected: [],
		headers: [
		{
			text: 'Thumbnail',
			align: 'center',
			sortable: false,
			value: 'downloadURL'
		},
		{
			text: 'Associated Reseller ID',
			value: 'resellerData.agentId'
		},
		{
			text: 'First name',
			value: 'firstName'
		},
		{
			text: 'Middle initial',
			value: 'middleInitial'
		},
		{
			text: 'Last name',
			value: 'lastName'
		},
		{
			text: 'Birthday',
			value: 'birthday'
		},
		{
			text: 'Gender',
			value: 'gender'
		},
		{
			text: 'Email',
			value: 'email'
		},
		{
			text: 'Contact',
			value: 'contact'
		}
		],
		userPlaceholder: userPlaceholder
	}),
	async created () {
		this.fetchCustomers();
	},
	methods: {
		async fetchCustomers () {
			this.loading = true;

			try {
				const querySnapshot = await usersCollection.where('type', '==', 'Customer').get();
				const customers = querySnapshot.docs.map((doc) => {
					const data = doc.data();
					data.id = doc.id;
					return data;
				});

				const promises = [];
				const resellers = [];

				customers.forEach((customer) => {
					if (customer.resellerId) {
						const index = resellers.findIndex(r => r.id === customer.resellerId);
						if (index !== -1) {
							customer.resellerData = resellers[index];
						} else {
							promises.push(
								usersCollection.doc(customer.resellerId).get()
								.then((doc) => {
									customer.resellerData = doc.data();
									return customer;
								})
							);
						};
					} else {
						promises.push(customer);
					}
				});

				this.items = await Promise.all(promises);

				console.log(this.items)
			} catch (error) {
				console.log(error);
			}

			this.loading = false;
		}
	},
	mixins: [mixins]
}
</script>
