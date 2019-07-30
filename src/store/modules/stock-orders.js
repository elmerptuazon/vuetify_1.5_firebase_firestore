import { DB, AUTH } from '@/config/firebase';

const companies = {
    namespaced: true,
    state: {
        companies: []
    },
    getters: {
        GET_COMPANIES: state => state.companies
    },
    mutations: {
        SET_COMPANIES(state, payload) {
            state.companies = payload;
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

        async UPDATE_STATUS({ }, payload) {
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
            } catch (error) {
                throw error;
            }
        }
    }
}

export default companies;
