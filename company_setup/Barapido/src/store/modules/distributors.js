import { DB } from '@/config/firebase';

const distributors = {
    namespaced: true,
    state: {
    },
    getters: {
    },
    mutations: {
    },
    actions: {
        async FIND({ rootState, commit, dispatch }, payload) {
            try {

                const querySnapshot = await DB
                    .collection('accounts')
                    .where('type', '==', 'Reseller')
                    .get();

                const distributors = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    return data;
                });

                return distributors;
            } catch (error) {
                throw error;
            }
        },
        async FIND_ALL({ rootState }) {
            try {

                const querySnapshot = await DB
                    .collection('accounts')
                    .where('type', '==', 'Reseller')
                    .get();

                const distributors = querySnapshot.docs.map((doc) => {

                    const data = doc.data();
                    if (data.status === "pending") {
                        data.position = 1;
                    } else if (data.status === "approved") {
                        data.position = 2;
                    } else if (data.status === "denied") {
                        data.position = 3;
                    }
                    data.id = doc.id;
                    return data;
                });

                return distributors;
            } catch (error) {
                throw error;
            }
        },
        async FIND_BY_REG_STATUS({ rootState }, status) {
            try {

                const companyId = rootState.auth.user.companyId;

                const querySnapshot = await DB
                    .collection('accounts')
                    // .where('status', '==', status)
                    .where('type', '==', 'Reseller')
                    .where('companyId', '==', companyId)
                    .get();

                const distributors = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    return data;
                });

                return distributors;
            } catch (error) {
                throw error;
            }
        },

        async UPDATE_STATUS({ }, payload) {
            try {
                const obj = {
                    status: payload.status
                }

                if (payload.status === 'approved') {
                    obj.agentId = payload.agentId;
                }

                if (payload.remarks) {
                    obj.remarks = payload.remarks;
                }

                if (payload.hasNoOrders) {
                    obj.hasNoOrders = payload.hasNoOrders;
                }

                await DB.collection('accounts').doc(payload.uid).update(obj);
            } catch (error) {
                throw error;
            }
        },

        async UPDATE_STATUS_BY_FIELD({ }, payload) {
            const { key, value, uid } = payload;

            try {
                await DB.collection('accounts').doc(uid).update({ [key]: value });
            } catch (error) {
                throw error;
            }
        }
    }
}

export default distributors;
