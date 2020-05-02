import { DB, AUTH } from '@/config/firebase';

const inventory = {
    namespaced: true,
    state: {
        products: [],
        subscriber: null,
    },
    getters: {
        GET_ALL_PRODUCTS: state => state.products,
        GET_INVENTORY_NOTIF(state) {
            let productsWithNotif = 0;
            state.products.forEach(product => {
                const availableQTY = parseInt(product.onHandQTY || 0) - parseInt(product.allocatedQTY || 0);
                
                if(product.isOutofStock || availableQTY <= product.reOrderLevel) {
                    productsWithNotif += 1;
                }
            });

            return productsWithNotif;
        }
    },
    mutations: {
        ClearProducts(state) {
            state.products = [];
        },
        AddProduct(state, payload) {
            state.products.unshift(payload);
        },
        UpdateProduct(state, payload) {
            const index = state.products.findIndex((product) => product.id === payload.id);
            if(index !== -1) {
                Object.keys(payload).forEach((key) => {
                    state.products[index][key] = payload[key];
                });
            }
        },
        RemoveProduct(state, payload) {
            const index = state.products.findIndex((product) => product.id === payload.id);
            if(index !== -1) {
                state.products.splice(index, 1);
            }
        }
    },
    actions: {
        LISTEN_TO_PRODUCT_STATS({state, commit}) {
            commit('ClearProducts');
            console.log('listening to product changes...');
            state.subscriber = DB.collection('products').onSnapshot((snapshot) => {
                
                let changes = snapshot.docChanges();

                changes.forEach((change) => {
                    let data = change.doc.data();
                    data.id = change.doc.id; 

                    switch(change.type) {
                        case 'added': {
                            if(!state.products.length) {
                                console.log('product was added in!', data);
                                commit('AddProduct', data);
                            
                            } else {
                                //avoid pushing the same product on the list
                                const lastProductAdded = state.products[0];
                                if(lastProductAdded.id !== data.id) {
                                    console.log('product was added!', data);
                                    commit('AddProduct', data);
                                }
                            }

                            break;
                        }

                        case 'modified': {
                            console.log('product was modified!', data);
                            commit('UpdateProduct', data);
                            break;
                        }

                        case 'removed': {
                            console.lod('product was removed!', data);
                            commit('RemoveProduct', data);
                            break;
                        }

                        default: {
                            console.log('product with unknown change type: ', data);
                        }
                    }
                });
            });
        },

        UNSUBSCRIBE_TO_PRODUCT_STATS({state}) {
            if(state.subscriber) {
                state.subscriber();
            }
        },

        async UPDATE_PRODUCT_DETAIL({}, payload) {
            const { id, key, value } = payload;
            try {
                await DB.collection('products').doc(id).update({ [key]: value });

                return {
                    isSuccessful: true
                };
            
            } catch(error) {
                console.log(error);
                throw error;
            }
        }

    }
};

export default inventory;