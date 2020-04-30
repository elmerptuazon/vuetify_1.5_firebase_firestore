import { DB } from '@/config/firebase';

const distributors = {
    namespaced: true,
    state: {
        subscriber: null,
        resellersList: [],
    },
    getters: {
        GET_RESELLERS_LIST: state => state.resellersList,

        //get the length of the filtered resellerList array of resellers who are pending and not yet been read.
        GET_NEW_RESELLER_COUNT: state => state.resellersList.filter((reseller) => !reseller.isRead).length
    },
    mutations: {
        SET_RESELLERS_LIST(state, payload) {
            state.resellersList = payload;
        }
    },
    actions: {
        async LISTEN_TO_NEW_REGISTRATIONS({ state, commit, dispatch }) {
            commit('SET_RESELLERS_LIST', []);
            let accountsToModify = [];

            state.subscriber = DB.collection('accounts')
                .where('type', '==', 'Reseller')
                .orderBy('createdAt', 'desc')
                .onSnapshot((snapshot) => {
                    console.log('listening to new registrations');

                    let changes = snapshot.docChanges();

                    changes = changes.map((change) => {

                        let data = change.doc.data();
                        data.id = change.doc.id;

                        data.type = change.type;

                        console.log(data);

                        if(!data.hasOwnProperty('isRead') 
                            && data.status.toLowerCase() === 'pending'
                        ) {
                            
                            data.isRead = false;
                            accountsToModify.push(data);

                        } else if(!data.hasOwnProperty('isRead')) {
                            data.isRead = true;
                            accountsToModify.push(data);
                        }

                        return data;
                    })

                    if(!state.resellersList || !state.resellersList.length) {
                        commit('SET_RESELLERS_LIST', changes);
                    
                    } else {
                        changes.forEach((change) => {
                            if(change.type === 'added' 
                                && (!change.isRead || !change.hasOwnProperty('isRead'))
                            ) {
                                change.isRead = false;
                                state.resellersList.unshift(change);
                            
                            } else if(change.type === 'modified') {
                                const index = state.resellersList.findIndex((reseller) => {
                                    return reseller.id === change.id
                                });
                                if(index !== -1) {
                                    state.resellersList[index] = change;
                                    dispatch('conversations/listenToConversations', null, {root:true});
                                }
                            }

                            delete change.type;
                        })
                    } 

                })

            if(accountsToModify.length) {
                for(const account of accountsToModify) {
                    console.log('updating isRead of: ', account.id);
                    await dispatch('UPDATE_STATUS_BY_FIELD', {
                        uid: account.id,
                        key: 'isRead',
                        value: account.isRead,
                    });
                }
            }

        },

        UNSUBSCRIBE_FROM_NEW_RESELLERS({ state }) {
			if (state.subscriber) {
				state.subscriber();
			}
        },

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
