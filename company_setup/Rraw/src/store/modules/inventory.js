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
                            console.log('variant has been added: ', data);
                            if(!state.products.length) {
                                data.availableQTY = Number(data.onHandQTY) - Number(data.allocatedQTY);
                                if(data.availableQTY === 0) {
                                    data.isOutofStock = true;
                                }

                                if(data.isOutofStock) {
                                    data.position = 1;
                                
                                } else if(data.availableQTY <= Number(data.reOrderLevel)) {
                                    data.position = 1;
                        
                                } else {
                                    data.position = 2;
                                }
                        
                                commit('AddProduct', data);
                            
                            } else {
                                //avoid pushing the same product on the list
                                const lastProductAdded = state.products[0];
                                if(lastProductAdded.id !== data.id) {
                                    data.availableQTY = Number(data.onHandQTY) - Number(data.allocatedQTY);
                                    if(data.availableQTY === 0) {
                                        data.isOutofStock = true;
                                    }

                                    if(data.isOutofStock) {
                                        data.position = 1;
                                    
                                    } else if(data.availableQTY <= Number(data.reOrderLevel)) {
                                        data.position = 1;
                            
                                    } else {
                                        data.position = 2;
                                    }
                            
                                    commit('AddProduct', data);
                                }
                            }

                            break;
                        }

                        case 'modified': {
                            data.availableQTY = Number(data.onHandQTY) - Number(data.allocatedQTY);
                            if(data.availableQTY === 0) {
                                data.isOutofStock = true;
                            }

                            if(data.isOutofStock) {
                                data.position = 1;
                            
                            } else if(data.availableQTY <= Number(data.reOrderLevel)) {
                                data.position = 1;
                    
                            } else {
                                data.position = 2;
                            }
                    
                            console.log('variant was modified!', data);
                            commit('UpdateProduct', data);
                            break;
                        }

                        case 'removed': {
                            console.log('variant was removed!', data);
                            data.availableQTY = Number(data.onHandQTY) - Number(data.allocatedQTY);

                            if(data.isOutofStock) {
                                data.position = 1;
                            
                            } else if(data.availableQTY <= Number(data.reOrderLevel)) {
                                data.position = 1;
                    
                            } else {
                                data.position = 2;
                            }
                            
                            commit('RemoveProduct', data);
                            break;
                        }

                        default: {
                            console.log('variant with unknown change type: ', data);
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
                        variantName: null,

                        productName: productData.name,
                        productId: productData.id,
                        category: categoryName,

                        allocatedQTY: 0,
                        onHandQTY: 0,
                        reOrderLevel:  0,
                        isOutofStock: true,
                        minimumOrder: Number(productData.minimumOrder)
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
            const itemsInAttributes = productAttributes[0].items;
            const variantName = productAttributes[0].name;
            
            for(const variant of itemsInAttributes) {
                try {
                    await DB.collection('products').doc('details').collection('variants').add({
                        sku: `${variant.sku}`,
                        name: `${variant.name}`,
                        variantName,
                        weight: productData.weight,
                        price: productData.price,

                        productName: productData.name,
                        productId: productData.id,
                        category: categoryName,

                        allocatedQTY: 0,
                        onHandQTY: 0,
                        reOrderLevel:  0,
                        isOutofStock: true,
                        minimumOrder: Number(variant.minimumOrder)
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
            const productAttributes = productData.attributes;

            //if a product doesnt have attributes
            if(!productAttributes.length) {
                try {
                    //extract from the inventory list the variants associated to the edited product 
                    const existingVariants = state.products.filter(product => product.productId === productData.id);
                    
                    //if the product doesnt have existing variants, create one
                    if(!existingVariants.length) {
                        await DB.collection('products').doc('details').collection('variants').doc().set({
                            sku: productData.code,
                            name: `${productData.name.toLowerCase()}`,
                            variantName: null,
                            weight: Number(productData.weight),
                            price: Number(productData.price),

                            productName: productData.name,
                            productId: productData.id,
                            category: categoryName,
                            
                            allocatedQTY: 0,
                            onHandQTY: 0,
                            reOrderLevel:  0,
                            isOutofStock: true,
                            minimumOrder: Number(productData.minimumOrder)
                        });
                    
                    } else if(existingVariants.length === 1) {
                        //if a single variant exist for the product, then just update it
                        DB.collection('products').doc('details').collection('variants').doc(existingVariants[0].id)
                        .update({
                            sku: productData.code,
                            name: `${productData.name.toLowerCase()}`,
                            variantName: null,
                            weight: Number(productData.weight),
                            price: Number(productData.price),

                            productName: productData.name,
                            productId: productData.id,
                            category: categoryName,
                            minimumOrder: Number(productData.minimumOrder)
                        });

                    } else {
                        //if there are existing variants, remove them and create a single variant for the product. Based from its details.
                        const batch = DB.batch();
                        const variantsCollection = DB.collection('products').doc('details').collection('variants');
                        
                        //delete the existing variants of the product
                        for(const variant of existingVariants) {
                            batch.delete(variantsCollection.doc(variant.id));
                        }

                        //create a single variant out from the product's details
                        batch.set(variantsCollection.doc(), {
                            sku: productData.code,
                            name: `${productData.name.toLowerCase()}`,
                            variantName: null,
                            weight: Number(productData.weight),
                            price: Number(productData.price),

                            productName: productData.name,
                            productId: productData.id,
                            category: categoryName,
                            
                            allocatedQTY: 0,
                            onHandQTY: 0,
                            reOrderLevel:  0,
                            isOutofStock: true,
                            minimumOrder: Number(productData.minimumOrder)
                        });

                        await batch.commit();
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

                return { isSuccessful };
            }
            
            //if the edited product has attributes, proceed below.

            //extract variants from the edited product
            const variant = productAttributes[0];
            const itemsInAttributes = variant.items;
            const variantName = variant.name;
            
            console.log(itemsInAttributes);
            
            //extract existing variants from the inventory
            const existingVariants = state.products.filter(product => product.productId === productData.id);
            
            //if there are no variants in the inventory associated to the edited product. 
            //But the edited product has attributes on it, then create the variants
            if(itemsInAttributes.length && !existingVariants.length) {
                try {
                    await dispatch('CREATE_VARIANTS_FROM_PRODUCT', { productData });

                    return { isSuccessful: true };

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
            
            //if there are variants in the inventory associated to the edited product.
            //And the edited product has attributes on it, then re-create the variants.

            const variantsSubCollectionRef = DB.collection('products').doc('details').collection('variants');
            const batch = DB.batch();
            
            for(const newVariant of itemsInAttributes) {
                let matchedVariantIndex = existingVariants.findIndex(existingVariant => (existingVariant.sku === newVariant.sku) || (existingVariant.name === newVariant.name));

                //if an existing variant has the same SKU or NAME on one of the edited product's variant
                //then update it only
                if(matchedVariantIndex !== -1) {
                    batch.update(variantsSubCollectionRef.doc(existingVariants[matchedVariantIndex].id), {
                        sku: newVariant.sku,
                        name: newVariant.name,
                        variantName,
                        category: categoryName,
                        productName: productData.name,
                        price: Number(productData.price),
                        weight: Number(productData.weight),
                        minimumOrder: Number(newVariant.minimumOrder)
                    });

                    //remove from the existing variant list the variant that has been edited
                    existingVariants.splice(matchedVariantIndex, 1);
                    continue; //proceed to the next newVariant
                }

                //If there is an existing variant in the inventory, that has exactly the same content as the new variant from the edited product.
                //Then leave it as is.
                matchedVariantIndex = existingVariants.findIndex(existingVariant => (existingVariant.sku === newVariant.sku) && (existingVariant.name === newVariant.name));
                if(matchedVariantIndex !== -1) {
                    existingVariants.splice(matchedVariantIndex, 1);
                    continue;
                }

                //if the new variant, from the edited product, is not included in the existing variants in the inventory. Then create that new variant
                batch.set(variantsSubCollectionRef.doc(), {
                    sku: newVariant.sku,
                    name: newVariant.name,
                    variantName, 
                    weight: Number(productData.weight),
                    price: Number(productData.price),

                    productName: productData.name,
                    productId: productData.id,
                    category: categoryName,
                    
                    allocatedQTY: 0,
                    onHandQTY: 0,
                    reOrderLevel:  0,
                    isOutofStock: true,
                    minimumOrder: Number(newVariant.minimumOrder)
                });
            }

            // delete the remaining existing variants associated to the edited product
            if(existingVariants.length) {
                for(const variant of existingVariants) {
                    batch.delete(variantsSubCollectionRef.doc(variant.id));
                }
            }

            try {
                await batch.commit();
                return { isSuccessful: true };
            
            } catch(error) {
                throw { origin: 'inventory/EDIT_VARIANT_FROM_PRODUCT: batch updating existing variants' };
            }

        }, 

        async UPDATE_MULTIPLE_PRODUCT_FIELDS({}, payload) {
            const { updatedDetails, id } = payload;
            try {
                await DB.collection('products').doc('details').collection('variants').doc(id).update(updatedDetails);

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