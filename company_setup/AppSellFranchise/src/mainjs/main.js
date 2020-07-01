// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import router from './router';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import SocialSharing from 'vue-social-sharing';
import { VueExtendLayout, layout } from 'vue-extend-layout';
import SweetModal from 'sweet-modal-vue/src/plugin.js';
import VueSweetalert2 from 'vue-sweetalert2';
import VueProgressBar from 'vue-progressbar';
import Vue2Filters from 'vue2-filters';
import store from './store'
import { AUTH } from './config/firebase';
import JsonExcel from 'vue-json-excel';
import '@fortawesome/fontawesome-free/css/all.css';

Vue.component('downloadExcel', JsonExcel)
Vue.config.productionTip = false;

Vue.use(Vuetify, {
	theme: {
		primary: process.env.primaryColor,
		secondary: '#424242',
		accent: '#82B1FF',
		error: '#FF5252',
		info: '#2196F3',
		success: '#4CAF50',
		warning: '#FFC107'
	},
	iconfont: 'md' || 'fa',
});
Vue.use(SocialSharing);
Vue.use(VueExtendLayout);
Vue.use(SweetModal);
Vue.use(Vue2Filters);
Vue.use(VueProgressBar);
Vue.use(VueSweetalert2);

/* eslint-disable no-new */
let app;

AUTH.onAuthStateChanged(async (user) => {
	if (!app) {
		if (user) {
			try {
				await store.dispatch('auth/REAUTHENTICATE', user.uid);
			} catch (e) {
				console.log(e);
			}

			app = new Vue({
				el: '#app',
				router,
				store,
				...layout
			});
		} else {
			app = new Vue({
				el: '#app',
				router,
				store,
				...layout
			});
		}
	}
});
