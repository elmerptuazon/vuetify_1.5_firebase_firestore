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
        GET_NEW_RESELLER_COUNT(state) {
            const unreadReseller = state.resellersList.filter((reseller) => !reseller.isRead || !reseller.hasOwnProperty('isRead'));
            return unreadReseller.length;
        } 
    },
    mutations: {
        SET_RESELLERS_LIST(state, payload) {
            state.resellersList = payload;
        },
        ADD_RESELLER(state, payload) {
            state.resellersList.push(payload);
        },
        UPDATE_RESELLER(state, payload) {
            const index = state.resellersList.findIndex(reseller => reseller.id === payload.id);
            if(index !== -1) {
                state.resellersList[index] = Object.assign({}, payload);
                state.resellersList = [...state.resellersList];
            }
        },
        REMOVE_RESELLER(state, payload) {
            const index = state.resellersList.findIndex(reseller => reseller.id === payload.id);
            if(index !== -1) {
                state.resellersList.splice(index, 1);
                state.resellersList = [...state.resellersList];
            }
        }
    },
    actions: {

        async LISTEN_TO_NEW_REGISTRATIONS({ state, commit, dispatch }) {
            commit('SET_RESELLERS_LIST', []);
            
            state.subscriber = DB.collection('accounts')
            .where('type', '==', 'Reseller')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                console.log('listening to new registrations');

                let changes = snapshot.docChanges();

                changes = changes.forEach((change) => {

                    let data = change.doc.data();
                    data.id = change.doc.id;

                    if(change.type === 'added') {
                        console.log('added reseller: ', change);
                        commit('ADD_RESELLER', data);
                    
                    } else if(change.type === 'modified') {
                        console.log('modified reseller: ', data);
                        commit('UPDATE_RESELLER', data);
                        dispatch('conversations/listenToConversations', null, {root:true});
                    
                    } else if(change.type === 'removed') {
                        console.log('removed reseller: ', data);
                        commit('REMOVE_RESELLER', data);
                    }

                    return data;
                })

            });

        },

        UNSUBSCRIBE_FROM_NEW_RESELLERS({ state }) {
			if (state.subscriber) {
				state.subscriber();
			}
        },

        async DELETE_RESELLER({}, userDetails) {
            const { email, id, userObj } = userDetails;
            try {
                await axios({
                    method: 'post',
                    url: `${process.env.accountManagementURL}/deleteUser`,
                    data: {
                        email: email
                    }
                });
                
                const batchOperation = DB.batch();

                //deleting account details
                await DB.collection('accounts').doc(id).delete();

                //deleting conversations relate to the branch
                const convoToBeDeletedRef = await DB.collection('conversations').where('users', 'array-contains', id).get();
                convoToBeDeletedRef.docs.forEach(convo => {
                    batchOperation.delete(DB.collection('conversations').doc(convo.id));
                });

                //delete profile picture related to the branch
                if(userObj.hasOwnProperty('downloadURL') || userObj.downloadURL) {
                    await STORAGE.ref('appsell').child('profile-pictures/' + id).delete();
                }

                //deleting messages related to the branch
                const messagesToDeleteRef = await DB.collection('messages').where('sender', '==', id).get();
                messagesToDeleteRef.docs.forEach(doc => {
                    batchOperation.delete(DB.collection('messages').doc(doc.id));
                });

                //deleting stockorders related to the branch
                const stockOrderToDeleteRef = await DB.collection('stock_orders').where('userId', '==', id).get();
                stockOrderToDeleteRef.docs.forEach(doc => {
                    batchOperation.delete(DB.collection('stock_orders').doc(doc.id));
                });

                //deleting shipments related to the branch
                const shipmentsToDeleteRef = await DB.collection('shipment').where('userDetails.userId', '==', id).get();
                shipmentsToDeleteRef.docs.forEach(doc => {
                    batchOperation.delete(DB.collection('shipment').doc(doc.id));
                });

                //deleting support message related to the branch
                const supportToDeleteRef = await DB.collection('support').where('uid', '==', id).get();
                supportToDeleteRef.docs.forEach(doc => {
                    batchOperation.delete(DB.collection('support').doc(doc.id));
                });

                await batchOperation.commit();

                return {
                    isSuccessful: true
                };

            } catch(error) {
                console.log(error);
                throw error;
            }
        },
        
        async RESEND_ACCOUNT_VERIFICATION({}, userDetails) {
            const { firstName, email } = userDetails;

            try {
                const response = await axios({
                    method: 'post',
                    url: `${process.env.accountManagementURL}/sendAccountVerification`,
                    data: {
                        firstName: firstName,
                        email: email,
                        company: process.env.companyName
                    }
                });

                return response;
            
            } catch(error) {
                throw error;
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
