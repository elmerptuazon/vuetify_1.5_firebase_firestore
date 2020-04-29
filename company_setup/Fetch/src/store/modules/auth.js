import { DB, AUTH } from '@/config/firebase';
import firebase from 'firebase/app';
const auth = {
	namespaced: true,
	state: {
		user: {}
	},
	getters: {
		GET_USER: state => state.user
	},
	mutations: {
		SET_USER(state, payload) {
			state.user = payload;
		}
	},
	actions: {
		async AUTHENTICATE({ commit, dispatch }, { email, password }) {
			try {
				const response = await AUTH.signInWithEmailAndPassword(email, password);

				try {
					const user = await DB.collection('accounts').doc(response.user.uid).get();
					const userData = user.data();
					userData.id = user.id;

					if (!userData.isAdmin) {
						await AUTH.signOut();
						throw {
							message: 'User not found'
						}
					}

					commit('SET_USER', userData);
					dispatch('stock_orders/LISTEN_TO_STOCK_ORDERS', null, { root: true });
					dispatch('shipment/LISTEN_TO_SHIPMENTS', null, { root: true });
					dispatch('distributors/LISTEN_TO_NEW_REGISTRATIONS', null, { root: true });
					dispatch('conversations/listenToConversations', null, { root: true });
					return userData;
				} catch (error) {
					await AUTH.signOut();
					throw error;
				}

			} catch (error) {
				throw error;
			}
		},
		async REAUTHENTICATE({ commit, dispatch }, uid) {
			try {
				const userData = await dispatch('GET_USER', uid);

				commit('SET_USER', userData);
				dispatch('stock_orders/LISTEN_TO_STOCK_ORDERS', null, { root: true });
				dispatch('shipment/LISTEN_TO_SHIPMENTS', null, { root: true });
				dispatch('distributors/LISTEN_TO_NEW_REGISTRATIONS', null, { root: true });
				dispatch('conversations/listenToConversations', null, { root: true });
				return;
			} catch (error) {
				await AUTH.signOut();
				throw error;
			}
		},
		async FIREBASE_REAUTHENTICATE({ }, payload) {

			var user = AUTH.currentUser;
			var cred = firebase.auth.EmailAuthProvider.credential(
				user.email, payload);
			return user.reauthenticateAndRetrieveDataWithCredential(cred);

		},
		async GET_USER({ }, uid) {
			try {
				const user = await DB.collection('accounts').doc(uid).get();
				const userData = user.data();
				userData.id = user.id;
				return userData;
			} catch (error) {
				throw error;
			}
		},
		async UPDATE_USER({ dispatch }, payload) {
			//await dispatch('FIREBASE_REAUTHENTICATE', payload.oldPassword);
			const userRef = DB.collection("accounts").doc(AUTH.currentUser.uid);
			return userRef.update(payload);
		},
		async LOGOUT({ commit, dispatch }) {
			try {
				await AUTH.signOut();
				commit('SET_USER', {});
				// UNSUBSCRIBE TO ORDERS
				dispatch('stock_orders/UNSUBSCRIBE_FROM_STOCK_ORDERS', {}, { root: true });
				dispatch('shipment/UNSUBSCRIBE_TO_SHIPMENTS', {}, { root: true });
				dispatch('distributors/UNSUBSCRIBE_FROM_NEW_RESELLERS', {}, { root: true });
			} catch (error) {
				throw error;
			}
		},
		async UPDATE_PASSWORD({ dispatch }, payload) {
			try {
				await dispatch('FIREBASE_REAUTHENTICATE', payload.oldPassword);
				await AUTH.currentUser.updatePassword(payload.newPassword);
				return true;
				//await dispatch('LOGOUT');
			}
			catch (error) {
				console.log(error)
				throw error;
			}
		}
	}
}

export default auth;
