import { DB, AUTH } from '@/config/firebase';

const stock_orders = {
    namespaced: true,
    state: {
        companies: [],
        stockOrder: {},
        stockOrderList: [],
        newOrderCount: 0,
        subscriber: null,
    },
    getters: {
        GET_COMPANIES: state => state.companies,
        GET_STOCK_ORDER_LIST: state => state.stockOrderList,
        GET_NEW_ORDER_COUNT(state) {
            //return length of array of orders that are not yet read by the user
            return state.stockOrderList.filter((order) => !order.isRead).length;
        }  
    },
    mutations: {
        SET_COMPANIES(state, payload) {
            state.companies = payload;
        },
        SET_STOCK_ORDER(state, payload) {
            state.stockOrder = Object.assign({}, payload);
        },
        SET_STOCK_ORDER_LIST(state, payload) {
            state.stockOrderList = payload;
        },
        UPDATE_STOCK_ORDER(state, payload) {
            for(const key of Object.keys(payload)) {
                state.stockOrder[key] = payload[key];
            }
        },
        ADD_TO_STOCK_ORDER_LIST(state, payload) {
            state.stockOrderList.unshift(payload);
            console.log('stock order has been added: ', payload);
        },
        UPDATE_STOCK_ORDER_LIST(state, payload) {
            const index = state.stockOrderList.findIndex(stockOrder => stockOrder.id === payload.id);
            if(index !== -1) {
                state.stockOrderList[index] = Object.assign({}, payload);
                state.stockOrderList = [...state.stockOrderList];
                console.log('stock order has been modified: ', payload);
            }
        },
        REMOVE_TO_STOCK_ORDER_LIST(state, payload) {
            const index = state.stockOrderList.findIndex(stockOrder => stockOrder.id === payload.id);
            if(index !== -1) {
                state.stockOrderList.splice(index, 1);
                state.stockOrderList = [...state.stockOrderList];
                console.log('stock order has been removed: ', payload);
            }
        }
    },
    actions: {

        async LISTEN_TO_STOCK_ORDERS({ state, commit, rootGetters, dispatch }) {
            const fetchedUsers = [];
            commit('SET_STOCK_ORDER_LIST', []);

            state.subscriber = DB.collection('stock_orders')
                .where('active', '==', false) //get all stock orders that are already submitted by a reseller
                .orderBy('submittedAt')
				.onSnapshot(async (snapshot) => {

					console.log('Listening to stock orders...');

                    let changes = snapshot.docChanges();

                    for(const change of changes) {
                        let data = change.doc.data();
                        data.id = change.doc.id;
                        
                        data.user = {};
                        const userIndex = fetchedUsers.findIndex(user => user.id === data.userId);
                        if (userIndex !== -1) {
                            data.user = fetchedUsers[userIndex];
                        } else {
                            try {
                                const userData = await dispatch('auth/GET_USER', data.userId, { root: true });
                                fetchedUsers.push(userData);
                                data.user = userData;
                            
                            } catch(error) {
                                console.log('error in stock order user data: ', error);
                            }
                        }

                        data.sku = data.items.length;
                        data.price = 0;
                        data.resellerPrice = 0;
                        data.items.forEach((item) => {
                            data.price += (item.qty * item.price);
                        });

                        if(change.type === 'added') {
                            commit('ADD_TO_STOCK_ORDER_LIST', data);
                        
                        } else if(change.type === 'modified') {
                            commit('UPDATE_STOCK_ORDER_LIST', data);
                        
                        } else if(change.type === 'removed') {
                            commit('REMOVE_TO_STOCK_ORDER_LIST', data);
                        }
   
                    }

				});
		},

		UNSUBSCRIBE_FROM_STOCK_ORDERS({ state }) {
			if (state.subscriber) {
				state.subscriber();
			}
        },
        
        async FIND({ state, commit, dispatch }) {
            const uid = AUTH.currentUser.uid;
            // commit('SET_STOCK_ORDER_LIST', []);
            try {

                const querySnapshot = await DB
                    .collection('stock_orders')
                    .where('active', '==', false)
                    .orderBy('submittedAt', 'desc')
                    .get();

                const data = querySnapshot.docs.map((doc) => {
                    let d = doc.data();
                    // if (data.status === "pending") {
                    //     data.position = 1;
                    // } else if (data.status === "processing") {
                    //     data.position = 2;
                    // } else if (data.status === "paid") {
                    //     data.position = 3;
                    // } else if (data.status === "shipped") {
                    //     data.position = 4;
                    // } else if (data.status === "delivered") {
                    //     data.position = 5;
                    // } else if (data.status === "cancelled") {
                    //     data.position = 6;
                    // }
                    d.id = doc.id;
                    return d;
                });

                const fetchedUsers = [];

                for (const d of data) {
                    const userIndex = fetchedUsers.findIndex(user => user.id === d.userId);
                    if (userIndex !== -1) {
                        d.user = fetchedUsers[userIndex];
                    } else {
                        d.user = await dispatch('auth/GET_USER', d.userId, { root: true });
                        fetchedUsers.push(d.user);
                    }

                    d.sku = d.items.length;
                    d.price = 0;
                    d.resellerPrice = 0;
                    d.items.forEach((item) => {
                        d.price += (item.qty * item.price);
                        d.resellerPrice += (item.qty * item.resellerPrice);

                    });
                }
                
                commit('SET_STOCK_ORDER_LIST', data);
                return data;
            } catch (error) {
                throw error;
            }
        },

        async GET_STOCK_ORDER({}, payload) {
            try {
                
                const stockOrderData = await DB.collection('stock_orders').doc(payload).get();
                const data = stockOrderData.data();
                data.id = stockOrderData.id;
                return data;

            } catch(error) {
                console.log(error);
                throw error;
            }
        },

        async UPDATE_STATUS({ commit }, payload) {
            try {

                const obj = {
                    status: payload.status,
                    id: payload.id,
                    statusTimeline: payload.statusTimeline
                }

                if (status === 'processing' || status === 'cancelled') {
                    obj.read = false;
                }

                await DB.collection('stock_orders').doc(payload.id).update(obj);
                commit('UPDATE_STOCK_ORDER', obj)
            } catch (error) {
                throw error;
            }
        },
        async UPDATE_STOCK_ORDER_DETAILS({ commit, dispatch, state }, payload) {
            try {

                // const obj = {
                //     status: payload.status,
                //     items: payload.items,
                //     statusTimeline: payload.statusTimeline,
                //     shipmentsToReceive: shipmentIncrement
                // }

                await DB.collection('stock_orders').doc(payload.referenceID).update(payload.updateObject);
                commit('UPDATE_STOCK_ORDER', payload.updateObject)
                await dispatch('POPULATE_STOCK_ORDER_ITEMS', state.stockOrder)
            } catch (error) {
                throw error;
            }
        },
        async UPDATE_STOCK_ORDER_PAYMENT_DETAILS({ commit }, payload) {
            try {

                await DB.collection('stock_orders').doc(payload.id).update({ paymentDetails: payload.paymentDetails });
                commit('UPDATE_STOCK_ORDER', { paymentDetails: payload.paymentDetails })

            } catch (error) {
                throw error;
            }
        },
        async POPULATE_STOCK_ORDER_ITEMS({ commit }, payload) {
            let stockOrder = payload
            const items = [];
            for (const product of payload.items) {
                const data = (await DB.collection("products")
                    .doc(product.productId)
                    .get()).data();
                product.downloadURL = data.downloadURL;
                product.name = data.name;
                if (typeof product.shippedQty === "undefined") {
                    product.shippedQty = 0;
                }
                items.push(product);
            }
            stockOrder.items = items;
            commit('SET_STOCK_ORDER', stockOrder)
        },

        
    }
}

export default stock_orders;
