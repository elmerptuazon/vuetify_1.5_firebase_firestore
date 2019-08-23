import { DB, AUTH } from '@/config/firebase';

const stock_orders = {
    namespaced: true,
    state: {
        companies: [],
        stockOrder: {}
    },
    getters: {
        GET_COMPANIES: state => state.companies
    },
    mutations: {
        SET_COMPANIES(state, payload) {
            state.companies = payload;
        },
        SET_STOCK_ORDER(state, payload) {
            state.stockOrder = payload
        },
        UPDATE_STOCK_ORDER(state, payload) {
            Object.keys(payload).forEach((key) => {
                state.stockOrder[key] = payload[key];
            });
            // key: the name of the object key
            // index: the ordinal position of the key within the object 
        }
    },
    actions: {
        async FIND({ commit, dispatch }) {
            const uid = AUTH.currentUser.uid;

            try {

                const querySnapshot = await DB
                    .collection('stock_orders')
                    .where('active', '==', false)
                    .orderBy('submittedAt', 'desc')
                    .get();

                const data = querySnapshot.docs.map((doc) => {
                    const d = doc.data();
                    if (d.status === "pending") {
                        d.position = 1;
                    } else if (d.status === "processing") {
                        d.position = 2;
                    } else if (d.status === "paid") {
                        d.position = 3;
                    } else if (d.status === "shipped") {
                        d.position = 4;
                    } else if (d.status === "delivered") {
                        d.position = 5;
                    } else if (d.status === "cancelled") {
                        d.position = 6;
                    }
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

                return data;
            } catch (error) {
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
                    obj.read = true;
                }

                await DB.collection('stock_orders').doc(payload.id).update(obj);
                commit('UPDATE_STOCK_ORDER', obj)
            } catch (error) {
                throw error;
            }
        },
        async UPDATE_STOCK_ORDER_DETAILS({ commit, dispatch, state }, payload) {
            try {
                const obj = {
                    status: payload.status,
                    items: payload.items,
                    statusTimeline: payload.statusTimeline
                }

                await DB.collection('stock_orders').doc(payload.id).update(obj);
                commit('UPDATE_STOCK_ORDER', obj)
                dispatch('POPULATE_STOCK_ORDER_ITEMS', state.stockOrder)
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
        }
    }
}

export default stock_orders;
