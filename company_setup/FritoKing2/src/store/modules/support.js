import { DB, AUTH } from '@/config/firebase';

const support = {
    namespaced: true,
    state: {
        messages: [],
        subscriber: null,
    },
    getters: {
        GET_ALL_MESSAGES: state => state.messages,
        GET_SUPPORT_NOTIF(state) {
            let unreadSupport = 0;
            state.messages.forEach(message => {
                if(message.opened === false) unreadSupport += 1;
            });
            return unreadSupport;
        },
    },
    mutations: {
        ClearMessages(state) {
            state.messages = [];
        },
        AddMessage(state, payload) {
            state.messages.unshift(payload);

        },
        UpdateMessage(state, payload) {
            const index = state.messages.findIndex((message) => message.id === payload.id);
            if(index !== -1) {
                state.messages[index] = Object.assign({}, payload);
                state.messages = [...state.messages];
            }
        },
        RemoveMessage(state, payload) {
            const index = state.messages.findIndex((message) => message.id === payload.id);
            if(index !== -1) {
                state.messages.splice(index, 1);
            }
        }
    },
    actions: {
        async LISTEN_TO_SUPPORT({state, commit, dispatch}) {
            commit('ClearMessages');
            console.log('listening to support changes...');
            
            state.subscriber = DB.collection('support').onSnapshot(async (snapshot) => {

                let changes = snapshot.docChanges();

                changes.forEach(async (change) => {
                    let data = change.doc.data();
                    data.id = change.doc.id; 

                    switch(change.type) {
                        case 'added': {
                            console.log('support message has been added: ', data);
                            const user = await dispatch('auth/GET_USER', data.uid, { root: true });
                            
                            data.user = user ? user : null;

                            if(!state.messages.length) {
                                commit('AddMessage', data);
                            
                            } else {
                                //avoid pushing the same product on the list
                                const lastMessageAdded = state.messages[0];
                                if(lastMessageAdded.id !== data.id) {
                                    commit('AddMessage', data);
                                }
                            }

                            break;
                        }

                        case 'modified': {
                            console.log('support was modified!', data);
                            const user = await dispatch('auth/GET_USER', data.uid, { root: true });
                            
                            data.user = user ? user : null;

                            commit('UpdateMessage', data);
                            break;
                        }

                        case 'removed': {
                            console.log('support was removed!', data);
                            commit('RemoveMessage', data);
                            break;
                        }

                        default: {
                            console.log('support with unknown change type: ', data);
                        }
                    }
                });

            });
        },

        UNSUBSCRIBE_TO_SUPPORT({state}) {
            if(state.subscriber) {
                state.subscriber();
            }
        },

        async MARK_AS_READ({state, commit}, supportId) {
            try {
                await DB.collection('support').doc(supportId).update({opened: true});
                return {success: true};
            } catch(error) {
                console.log(error);
            }
        }

    }
};

export default support;