import { DB, AUTH } from '@/config/firebase';
import firebase from 'firebase/app';
const articles = {
    namespaced: true,
    state: {
        articles: [],
        subscriber: null,
    },
    
    getters: {
        GET_ARTICLES: state => state.articles,
    },

    mutations: {
        SET_ARTICLES(state, payload) {
            state.articles = payload;
        },

        ADD_ARTICLE(state, payload) {
            state.articles.push(payload);
        },

        UPDATE_ARTICLE(state, payload) {
            const index = state.articles.findIndex((article) => article.id === payload.id);
           
            if(index !== -1) {
                Object.keys(payload.updatedDetails).forEach((key) => {
                    state.articles[index][key] = payload.updatedDetails[key];
                });    
            }
        },

        DELETE_ARTICLE(state, payload) {
            const index = state.articles.findIndex((article) => article.id === payload.id);

            if(index !== -1) {
                state.articles.splice(index, 1);
            }
        }
    },

    actions: {
        LISTEN_FOR_ARTICLES({ state, commit }) {
            commit('SET_ARTICLES', []);

            state.subscriber = DB.collection('articles')
                .orderBy('dateCreated', 'desc')
                .onSnapshot((snapshot) => {

                    snapshot.docChanges().forEach(async (change) => {
                            
                        const data = change.doc.data();
                        data.id = change.doc.id;

                        if(change.type === 'added' && !state.articles.length) {
                            commit('ADD_ARTICLE', data); //push first article to the list, if list is currently empty
                        
                        } else if(change.type === 'added' && state.articles.length) {
                            //ensure that the latest item is not a duplicate of the last article in the list
                            const lastItem = state.articles[state.articles.length - 1];
                            if(lastItem.id !== data.id) { 
                                commit('ADD_ARTICLE', data);
                            }

                        } else if(change.type === 'modified') {
                            commit('UPDATE_ARTICLE', data);
                        }

                    });

            })
        },

        async GET_ARTICLES({state, commit}) {
            commit('SET_ARTICLES', []);

            const querySnapshot = await DB.collection('articles').orderBy('dateCreated', 'desc').get();

            const articles = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                data.id = doc.id;
                return data;
            });

            commit('SET_ARTICLES', articles);
        },

        async ADD_ARTICLE({ state, commit, }, payload) {
            payload.created_at = Date.now();

            try {
                const response = await DB.collection('articles').add(payload);
            
                //if LISTEN_TO_ARTICLES is used for article retrieval, mutations for article is not needed
                if(!state.subscriber) {
                    payload.id = response.id;
                    commit('ADD_ARTICLE', payload);
                }
                
            
            } catch(error) {
                throw error;
            }
        },

        async UPDATE_ARTICLE({ state, commit }, payload) {

            try {
                const { id, updatedDetails } = payload;

                updatedDetails.updated_at = Date.now();

                await DB.collection('articles').doc(id).update(updatedDetails);

                //if LISTEN_TO_ARTICLES is used for article retrieval, mutations for article is not needed
                if(!state.subscriber) {
                    commit('UPDATE_ARTICLE', payload);
                }
                
            } catch(error) {
                throw error;
            }
            
        },

        async UPDATE_ARTICLE_BY_FIELD({ state, commit }, payload) {
            try {
                await DB.collection('articles').doc(payload.id).update({ [key]: value });

                //if LISTEN_TO_ARTICLES is used for article retrieval, mutations for article is not needed
                if(!state.subscriber) {
                    commit('UPDATE_ARTICLE', payload);
                }
                
            } catch(error) {
                throw error;
            }
            
        },
        
        async DELETE_ARTICLE({ state, commit }, id) {
            try {
                await DB.collection('articles').doc(id).delete();

                //if LISTEN_TO_ARTICLES is used for article retrieval, mutations for article is not needed
                if(!state.subscriber) {
                    commit('DELTE_ARTICLE', payload);
                }

            } catch(error) {
                throw error;
            }
        }
    }
}

export default articles