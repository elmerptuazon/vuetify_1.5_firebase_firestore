import Vue from 'vue';
import Router from 'vue-router';
import Login from '@/pages/Login';
import Articles from '@/pages/Articles';
import ViewCategory from '@/pages/ViewCategory';
import MultiProductUpload from '@/pages/MultiProductUpload';
import Resellers from '@/pages/Resellers';
import Customers from '@/pages/Customers';
import Products from '@/pages/Products';
import Transactions from '@/pages/Transactions';
import Support from '@/pages/Support';
import Categories from '@/pages/Categories';
import Messages from '@/pages/Messages';
import NewRegistrations from '@/pages/NewRegistrations';
import RegistrationDetails from '@/pages/RegistrationDetails';
import StockOrders from '@/pages/StockOrders';
import StockOrderDetails from '@/pages/StockOrderDetails';
import MyAccount from '@/pages/MyAccount';
import ShipmentReport from '@/pages/ShipmentReport';
import DeliverySettings from '@/pages/DeliverySettings';
import InventoryManagement from '@/pages/InventoryManagement';
import { AUTH } from '@/config/firebase';
import store from '@/store';

Vue.use(Router);

const router = new Router({
	routes: [
		{
			path: '/',
			name: 'Login',
			component: Login,
			meta: {
				layout: 'login',
				requiresAuth: false
			}
		},
		{
			path: '/view-category/:id',
			name: 'ViewCategory',
			component: ViewCategory,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/multi-upload',
			name: 'MultiProductUpload',
			component: MultiProductUpload,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/users/reseller',
			name: 'Resellers',
			component: Resellers,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/users/customers',
			name: 'Customers',
			component: Customers,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/reports/shipmentreport',
			name: 'ShipmentReport',
			component: ShipmentReport,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/products/orders',
			name: 'Products',
			component: Products,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/products/stock-orders',
			name: 'StockOrders',
			component: StockOrders,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/products/stock-orders/:id',
			name: 'StockOrderDetails',
			component: StockOrderDetails,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/support',
			name: 'Support',
			component: Support,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/messages',
			name: 'Messages',
			component: Messages,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/new-registrations',
			name: 'NewRegistrations',
			component: NewRegistrations,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/new-registrations/:uid',
			name: 'RegistrationDetails',
			component: RegistrationDetails,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/products/transactions',
			name: 'Transactions',
			component: Transactions,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/categories',
			name: 'Categories',
			component: Categories,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/MyAccount',
			name: 'MyAccount',
			component: MyAccount,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/DeliverySettings',
			name: 'DeliverySettings',
			component: DeliverySettings,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/articles',
			name: 'Articles',
			component: Articles,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/inventory',
			name: 'Inventory',
			component: InventoryManagement,
			meta: {
				requiresAuth: true
			}
		},
	]
});

router.beforeEach((to, from, next) => {
	const user = store.state.auth.user;
	if (to.matched.some(record => record.meta.requiresAuth)) {
		if (!AUTH.currentUser) {
			next({
				path: '/',
				query: {
					redirecT: to.fullPath
				}
			});
		} else {
			next();
		}
	} else if (to.matched.some(record => !record.meta.requiresAuth)) {
		if (AUTH.currentUser) {
			next({
				path: '/articles',
				query: {
					redirecT: to.fullPath
				}
			});
		} else {
			next();
		}
	} else {
		next();
	}
});

export default router;
