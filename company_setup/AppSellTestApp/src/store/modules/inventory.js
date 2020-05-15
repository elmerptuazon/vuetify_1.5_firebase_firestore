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
        async LISTEN_TO_PRODUCT_STATS({state, commit, dispatch}) {
            commit('ClearProducts');
            console.log('listening to product changes...');
            
            state.subscriber = DB.collection('products').doc('details').collection('variants')
            .onSnapshot((snapshot) => {

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

        async CREATE_VARIANTS_FROM_PRODUCT({}, payload) {
            let isSuccessful = false;

            const { productData } = payload;
            const productAttributes = productData.attributes;

            const categoryDoc = await DB.collection('catalogues').doc(productData.categoryid).get();
            const categoryName = categoryDoc.data();
            
            //if a product doesnt have an attribute make one entry of it on the variants 
            if(!productAttributes.length) {
                try {
                    await DB.collection('products').doc('details').collection('variants').add({
                        sku: productData.code,
                        name: `${productData.name}`,
                        weight: productData.weight,
                        price: productData.price,
                        productId: productData.id,
                        category: categoryName,
                        allocatedQTY: 0,
                        onHandQTY: 0,
                        reOrderLevel:  0,
                        isOutofStock: true,
                    });

                    isSuccessful = true;
                
                } catch(error) {
                    console.log(error);
                    isSuccessful = false;
                    throw error;
                }

                return {
                    isSuccessful
                };
            }

            let batch = DB.batch();
            const variantsSubCollectionRef = DB.collection('products').doc('details').collection('variants').doc();
            
            const itemsInAttributes = productData.attributes.map(attribute => attribute.items);
            const productVariants = [].concat(...itemsInAttributes);
            productVariants.forEach(variant => {
                const { sku, name, weight, price } = variant;

                batch.set(variantsSubCollectionRef, {
                    sku,
                    name: `${productData.name} - ${name}`,
                    weight,
                    price,
                    productId: productData.id,
                    category: categoryName,
                    allocatedQTY: 0,
                    onHandQTY: 0,
                    reOrderLevel:  0,
                    isOutofStock: true
                });
            });

            try {
                await batch.commit();
                return {
                    isSuccessful: true
                };
            
            } catch(error) {
                console.log(error);
                throw error;
            }

        },

        async UPDATE_MULTIPLE_PRODUCT_FIELDS({}, payload) {
            const { updateDetails, id } = payload;
            try {
                await DB.collection('products').doc(id).update(updateDetails);

                return {
                    isSuccessful: true, 
                };
            
            } catch(error) {
                console.log(error);
                throw error;
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