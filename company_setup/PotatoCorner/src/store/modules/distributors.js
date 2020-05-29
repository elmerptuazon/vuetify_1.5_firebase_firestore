import { DB, AUTH } from '@/config/firebase';
import axios from 'axios';

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
                Object.keys(payload).forEach(key => {
                    state.resellersList[index][key] = payload[key];
                });
            }
        }
    },
    actions: {
        async ADD_BRANCH({}, payload) {
            console.log('adding branch: ', payload);
            try {

                payload.email = payload.email.toLowerCase();
                console.log('creating branch account...')
                const response = await AUTH.createUserWithEmailAndPassword(payload.email, 'potatocorner');
                
                console.log('sending account verification...');

                await axios({
                    method: 'post',
                    url: `${process.env.accountManagementURL}/sendAccountVerification`,
                    data: {
                        firstName: payload.firstName,
                        email: payload.email,
                        company: process.env.companyName
                    }
                });

                console.log('sending account verification done!');
                
                payload.customers = [];
                payload.type = 'Reseller';
                payload.status = 'approved';
                payload.createdAt = Date.now();

                console.log('saving brach details to DB...');
                await DB.collection('accounts').doc(response.user.uid).set(payload);
                payload.id = response.user.uid;

                console.log('creating conversation for admin and new branch...')
                await DB.collection('conversations').add({
                    created: Date.now(),
                    updated: Date.now(),
                    opened: {
                        [payload.id]: true,
                        ["admin"]: true
                    },
                    users: [payload.id, "admin"]
                });

                return {
                    isSuccessful: true
                };
                

            } catch(error) {
                console.log(error);
                throw error;
            }

        }, 

        async UPDATE_BRANCH({}, payload) {
            const { id, updatedDetails } = payload;

            try {
                if(updatedDetails.hasOwnProperty('id')) {
                    delete updatedDetails.id;
                }

                const oldDetailsRef = await DB.collection('accounts').doc(id).get();
                const oldDetails = oldDetailsRef.data();

                if(oldDetails.email !== updatedDetails.email) {
                    await axios({
                        method: 'post',
                        url: `${process.env.accountManagementURL}/updateEmail`,
                        data: {
                            oldEmail: oldDetails.email,
                            newEmail: updatedDetails.email,
                        }
                    });

                    console.log('email updated!');
                }

                await DB.collection('accounts').doc(id).update(updatedDetails);

                return {
                    isSuccessful: true,
                }

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
        async LISTEN_TO_NEW_REGISTRATIONS({ state, commit, dispatch }) {
            commit('SET_RESELLERS_LIST', []);
            let accountsToModify = [];

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
                            state.resellersList.unshift(data);
                        
                        } else if(change.type === 'modified') {
                            const index = state.resellersList.findIndex(reseller => reseller.id === data.id);
                            if(index !== -1) {
                                state.resellersList[index] = Object.assign({}, data);
                                console.log('modified reseller: ', data);
                                dispatch('conversations/listenToConversations', null, {root:true});
                            }
                        }

                        return data;
                    })

                })


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
