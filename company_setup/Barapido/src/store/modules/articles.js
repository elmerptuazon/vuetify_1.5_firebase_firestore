import { DB, AUTH, STORAGE } from '@/config/firebase';
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
            state.articles.unshift(payload);
        },

        UPDATE_ARTICLE(state, payload) {
            const index = state.articles.findIndex((article) => article.id === payload.id);
           
            if(index !== -1) {
                Object.keys(payload.updatedDetails).forEach((key) => {
                    state.articles[index][key] = payload.updatedDetails[key];
                });    
            }
        },

        UPDATE_ARTICLE_BY_FIELD(state, payload) {
            const index = state.articles.findIndex((article) => article.id === payload.id);
           
            if(index !== -1) {
                state.articles[index][payload.key] = payload.value;
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
                            state.articles.push(data); //push first article to the list, if list is currently empty
                        
                        } else if(change.type === 'added' && state.articles.length) {
                            //ensure that the latest item is not a duplicate of the last article in the list
                            const lastItem = state.articles[state.articles.length - 1];
                            if(lastItem.id !== data.id) { 
                                commit('ADD_ARTICLE', data);
                            }

                        } else if(change.type === 'modified') {
                            commit('UPDATE_ARTICLE', {
                                updatedDetails: {...data}
                            });
                        
                        } else if(change.type === 'removed') {
                            const index = state.articles.findIndex(article => article.id === data.id);

                            if(index !== -1) {
                                state.articles.splice(index, 1);
                            }
                        }

                    });

            })
        },

        async GET_ARTICLES({state, commit}) {
            commit('SET_ARTICLES', []);

            const querySnapshot = await DB.collection('articles').orderBy('created_at', 'desc').get();

            const articles = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                data.id = doc.id;
                return data;
            });

            commit('SET_ARTICLES', articles);
        },

        async ADD_ARTICLE({ state, commit, dispatch }, payload) {
            payload.created_at = Date.now();

            try {
                let file;
                if(payload.hasOwnProperty("file")) {
                    file = payload.file;
                    delete payload.file;
                    payload.headerURL = null;
                }

                const response = await DB.collection('articles').add(payload);
                payload.id = response.id;

                if(file) {
                    const metadata = { contentType: file.type };
                    const uploadedPic = await STORAGE.ref("appsell/").child("articles/" + payload.id).put(file, metadata);
                    const downloadURL = await uploadedPic.ref.getDownloadURL();

                    payload.headerURL = downloadURL;

                    console.log(downloadURL);

                    await dispatch('UPDATE_ARTICLE_BY_FIELD', {
                        id: payload.id,
                        key: 'headerURL',
                        value: downloadURL
                    });
                }

                //if LISTEN_TO_ARTICLES is used for article retrieval, mutations for article is not needed
                if(!state.subscriber) {
                    state.articles.unshift(payload);
                }
                
                return payload; 
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
            const { id, key, value } = payload;

            try {
                await DB.collection('articles').doc(id).update({ [key]: value });

                //if LISTEN_TO_ARTICLES is used for article retrieval, mutations for article is not needed
                if(!state.subscriber) {
                    commit('UPDATE_ARTICLE_BY_FIELD', payload);
                }
                
            } catch(error) {
                throw error;
            }
            
        },
        
        async DELETE_ARTICLE({ state, commit }, article) {
            console.log("starting to delete...")
            if(article.headerURL) {
                try {
                    await STORAGE.ref('appsell/').child('articles/' + article.id).delete();
                    console.log("header pic has been deleted")

                } catch(error) {
                    console.log(error);
                }
            }
            
            try {
                console.log("deleting doc in DB")
                await DB.collection('articles').doc(article.id).delete();

                //if LISTEN_TO_ARTICLES is used for article retrieval, mutations for article is not needed
                if(!state.subscriber) {
                    commit('DELETE_ARTICLE', article);
                }

            } catch(error) {
                throw error;
            }
        }, 

        async DELETE_HEADER_PIC({ state, commit }, id) {
            try {
                await STORAGE.ref("appsell/").child("articles/" + id).delete();
                
            } catch(error) {
                throw error;
            }
        },

        async REPLACE_HEADER_PIC({ state, commit }, payload) {
            const { id, file } = payload;
            const metadata = { contentType: file.type };

            try {
                const response = await STORAGE.ref("appsell/").child("articles/" + id).put(file, metadata);
                const downloadURL = await response.ref.getDownloadURL();
                
                return downloadURL;
            
            } catch(error) {
                throw error;
            }
        }
    }
}

export default articles