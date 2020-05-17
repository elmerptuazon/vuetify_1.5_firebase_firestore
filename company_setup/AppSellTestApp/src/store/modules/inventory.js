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
                // Object.keys(payload).forEach((key) => {
                //     state.products[index][key] = payload[key];
                // });
                state.products[index] = Object.assign({}, payload);
                state.products = [...state.products];
            }
        },
        RemoveProduct(state, payload) {
            const index = state.products.findIndex((product) => product.id === payload.id);
            if(index !== -1) {
                state.products.splice(index, 1);
                state.products = [...state.products];
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
                            console.log('product was removed!', data);
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

        COMBINE_ALL_ATTRIBUTES({}, attributes) {
            if(attributes.length > 1) {
                return attributes.reduce((a, b) => a.reduce((r, v) => r.concat(b.map(w => [].concat(v, w))), [])).map(i => i.join('-'));
            
            } else {
                //just extract all the element from the 
                return attributes[0].map(variant => variant);
            }
        },

        async CREATE_VARIANTS_FROM_PRODUCT({state, commit, dispatch}, payload) {
            let isSuccessful = false;

            const { productData } = payload;

            try {
                var categoryDoc = await DB.collection('catalogues').doc(productData.categoryId).get();
                var categoryName = categoryDoc.data().name;
            
            } catch(error) {
                console.log('inventory/CREATE_VARIANTS_FROM_PRODUCT, getting category name: ', error);
                throw {
                    origin: 'inventory/CREATE_VARIANTS_FROM_PRODUCT, getting category name: ',
                    error
                };
            }
            
            //if a product doesnt have an attribute 
            //make a variant that is representative of the product 
            const productAttributes = productData.attributes;
            if(!productAttributes.length) {
                try {
                    await DB.collection('products').doc('details').collection('variants').add({
                        sku: productData.code,
                        name: `${productData.name.toLowerCase()}`,
                        weight: productData.weight,
                        price: productData.price,

                        productName: productData.name,
                        productId: productData.id,
                        category: categoryName,

                        allocatedQTY: 0,
                        onHandQTY: 0,
                        reOrderLevel:  0,
                        isOutofStock: true,
                    });

                    isSuccessful = true;
                
                } catch(error) {
                    console.log('inventory/CREATE_VARIANTS_FROM_PRODUCT, creating variants in variants subcollection:', error);
                    isSuccessful = false;
                    throw {
                        origin: 'inventory/CREATE_VARIANTS_FROM_PRODUCT, creating variants in variants subcollection:',
                        error
                    };
                }
                
                //early return to terminate this action immediately
                return {
                    isSuccessful
                };
            }
            
            //if the product has attributes, then proceed to the steps below
            
            //extract all the variants object from the "items" field in each attributes of the product.
            const itemsInAttributes = productData.attributes.map(attribute => attribute.items);

            //create variants from all the items that is found in the attributes of the product
            const productVariants = await dispatch('COMBINE_ALL_ATTRIBUTES', itemsInAttributes); 
            
            let skuID = 0;
            for(const variant of productVariants) {
                try {
                    await DB.collection('products').doc('details').collection('variants').add({
                        sku: `${productData.code}-${skuID++}`,
                        name: `${variant.toLowerCase()}`,
                        weight: productData.weight,
                        price: productData.price,
                        
                        productName: productData.name,
                        productId: productData.id,
                        category: categoryName,

                        allocatedQTY: 0,
                        onHandQTY: 0,
                        reOrderLevel:  0,
                        isOutofStock: true
                    });
                
                } catch(error) {
                    console.log(
                        'inventory/CREATE_VARIANTS_FROM_PRODUCT, creating variants in variants subcollection for loop:', 
                        error
                    );
                    throw {
                        origin: 'inventory/CREATE_VARIANTS_FROM_PRODUCT, creating variants in variants subcollection for loop:',
                        error
                    };
                }

            }

            return {
                isSuccessful: true
            };

        },

        async EDIT_VARIANTS_FROM_PRODUCT({ state, commit, dispatch }, payload) {
            let isSuccessful = false;

            const { productData } = payload;

            const categoryDoc = await DB.collection('catalogues').doc(productData.categoryId).get();
            const categoryName = categoryDoc.data().name;
            
            //if a product doesnt have an attributes then edit its existing variants 
            const productAttributes = productData.attributes;
            if(!productAttributes.length) {
                try {
                    //extract from the inventory list the variants associated to the edited product 
                    const productVariants = state.products.filter(product => product.productId === productData.id);
                    
                    //if the product doesnt have variants yet, create one
                    if(!productVariants.length) {
                        await DB.collection('products').doc('details').collection('variants').add({
                            sku: productData.code,
                            name: `${productData.name.toLowerCase()}`,
                            weight: productData.weight,
                            price: productData.price,

                            productName: productData.name,
                            productId: productData.id,
                            category: categoryName,
                            
                            allocatedQTY: 0,
                            onHandQTY: 0,
                            reOrderLevel:  0,
                            isOutofStock: true
                        });
                    
                    //update the existing single variant of the edited product
                    } else {
                        await DB.collection('products').doc('details').collection('variants').doc(productVariants[0].id)
                        .update({
                            sku: productData.code,
                            name: `${productData.name.toLowerCase()}`,
                            weight: productData.weight,
                            price: productData.price,
                            productName: productData.name,
                            productId: productData.id,
                            category: categoryName,
                        });
                    }

                    isSuccessful = true;
                
                } catch(error) {
                    console.log(
                        'inventory/EDIT_VARIANTS_FROM_PRODUCT, adding a variant from a product without attributes:', 
                        error
                    );
                    isSuccessful = false;
                    throw {
                        origin: 'inventory/EDIT_VARIANTS_FROM_PRODUCT, adding a variant from a product without attributes:',
                        error
                    };
                }

                return {
                    isSuccessful
                };
            }
            
            //extract the variants that is present in each attributes of the edited product
            const itemsInAttributes = productData.attributes.map(attribute => attribute.items);
            const variantsInAttributes = await dispatch('COMBINE_ALL_ATTRIBUTES', itemsInAttributes);
            const variantsInInventory = state.products.filter(product => product.id === productData.id);
            //if there are no variants in the inventory that is associated to the edited product, 
            //but has attributes on it. Then create the variants
            if(!variantsInInventory.length && variantsInAttributes.length) {
                try {
                    await dispatch('CREATE_VARIANTS_FROM_PRODUCT', { productData });

                    return {
                        isSuccessful: true
                    }

                } catch(error) {
                    console.log(
                        'inventory/EDIT_VARIANTS_FROM_PRODUCT, creating variants for newly added attributes on a product:', 
                        error
                    );
                    throw {
                        origin: 'inventory/EDIT_VARIANTS_FROM_PRODUCT, creating variants for newly added attributes on a product:', 
                        error
                    };
                }
            }

            const variantsSubCollectionRef = DB.collection('products').doc('details').collection('variants');
            const batch = DB.batch();
            //update all variants associated to the product
            for(const variant of variantsInInventory) {
                //remove the top item in the new variants in attributes of the edited product
                //in order to monitor what variant has been updated
                const updatedVariantName = variantsInAttributes.shift();
                batch.update(variantsSubCollectionRef.doc(variant.id), {
                    name: updatedVariantName.toLowerCase(),
                    price: productData.price,
                    weight: productData.weight,
                    productName: productData.name,
                });
            }

            //if there are still remaining new variants in the attributes of the edited product
            //just add them to the product's variant
            if(variantsInAttributes.length) {
                let skuID = 0;
                for(const variant of variantsInAttributes) {
                    batch.add(variantsSubCollectionRef, {
                        sku: `${productData.code}-${skuID}`,
                        name: `${variant.toLowerCase()}`,
                        weight: productData.weight,
                        price: productData.price,

                        productName: productData.name,
                        productId: productData.id,
                        category: categoryName,
                        
                        allocatedQTY: 0,
                        onHandQTY: 0,
                        reOrderLevel:  0,
                        isOutofStock: true
                    });
                }
            }

            try {
                await batch.commit();
                return {
                    isSuccessful: true
                }
            
            } catch(error) {
                throw {
                    origin: 'inventory/EDIT_VARIANT_FROM_PRODUCT: batch updating existing variants'
                }
            }

        }, 

        async UPDATE_MULTIPLE_PRODUCT_FIELDS({}, payload) {
            const { updateDetails, id } = payload;
            try {
                await DB.collection('products').doc('details').collection('variants').doc(id).update(updateDetails);

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
                await DB.collection('products').doc('details').collection('variants').doc(id).update({ [key]: value });

                return {
                    isSuccessful: true
                };
            
            } catch(error) {
                console.log(error);
                throw error;
            }
        },

        async DELETE_PRODUCT({}, id) {
            try {
                await DB.collection('products').doc('details').collection('variants').doc(id).delete();

                return {
                    isSuccessful: true,
                }
            
            } catch(error) {
                console.log('inventory/DELETE_PRODUCT error', error);
                throw error;
            }
        }

    }
};

export default inventory;