import Vue from 'vue';
import Vuex from 'vuex';
import { DB } from '@/config/firebase';

// modules
import auth from './modules/auth';
import companies from './modules/companies';
import categories from './modules/categories';
import products from './modules/products';
import conversations from './modules/conversations';
import distributors from './modules/distributors';
import stock_orders from './modules/stock-orders';
import users from './modules/users';
import shipment from './modules/shipment';
import lalamove from './modules/lalamove';
Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		toolbarTitle: null,
		links: [
			{
				icon: 'dashboard',
				text: 'Categories',
				url: 'Categories',
			},
			{
				icon: 'cloud_upload',
				text: 'Multiple Product Upload',
				url: 'MultiProductUpload'
			},
			{
				icon: 'keyboard_arrow_up',
				'icon-alt': 'keyboard_arrow_down',
				text: 'Reports',
				model: false,
				children: [
					{ icon: 'insert_emoticon', text: 'Reseller List', url: 'Resellers' },
					{ icon: 'people', text: 'Customer List', url: 'Customers' },
					{ icon: 'shopping_basket', text: 'Products Ordered', url: 'Products' },
					{ icon: 'shopping_cart', text: 'Transactions', url: 'Transactions' },
					{ icon: 'local_shipping', text: 'Shipments', url: 'ShipmentReport' }
				]
			},
			{
				icon: 'airport_shuttle',
				text: 'Stock Orders',
				url: 'StockOrders',
			},
			{
				icon: 'supervisor_account',
				text: 'New Registrations',
				url: 'NewRegistrations',
			},
			{
				icon: 'messages',
				text: 'Messages',
				url: 'Messages',
			},
			{
				icon: 'contact_support',
				text: 'Support',
				url: 'Support',
			}]
	},
	getters: {
		GET_TOOLBAR_TITLE: state => state.toolbarTitle,
		GET_TOOLBAR_LINKS: state => state.links
	},
	mutations: {
		SET_TOOLBAR_TITLE(state, payload) {
			state.toolbarTitle = payload;
		}
	},
	actions: {
	},
	modules: {
		auth,
		companies,
		categories,
		products,
		conversations,
		distributors,
		stock_orders,
		users,
		shipment,
		lalamove
	}
})
