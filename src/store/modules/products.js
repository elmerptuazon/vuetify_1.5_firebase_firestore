import { DB } from '@/config/firebase';

const products = {
    namespaced: true,
    state: {
        productsList: []
    },
    getters: {
        GetProductsList: state => { return state.productsList }
    },
    mutations: {
        SetProductsList(state, payload) {
            state.productsList = payload;
        },
        AddProductsList(state, payload) {
            state.productsList.push(payload);
        },
        UpdateProductList(state, payload) {
            console.log("UpdateProductList mutation is activated!");
            let payloadproduct = payload.productData;
            state.productsList = state.productsList.map(product => {
                if (product.id == payloadproduct.id) {
                    if (payloadproduct.hasOwnProperty('active')) {
                        console.log('active found');
                        product.active = payloadproduct.active;
                    }
                    if (payloadproduct.hasOwnProperty('code')) {
                        console.log('product details found');
                        product.decription = payloadproduct.description;
                        product.isOutofStock = payloadproduct.isOutofStock;
                        product.name = payloadproduct.name;
                        product.price = payloadproduct.price;
                        product.resellerPrice = payloadproduct.resellerPrice;
                        product.sale = payloadproduct.sale;
                    }
                    if (payloadproduct.hasOwnProperty('downloadURL')) {
                        console.log('image url found');
                        product.pictureName = payloadproduct.pictureName;
                        product.downloadURL = payloadproduct.downloadURL;
                    }
                }
                return product;
            });
        },
        BatchUpdateProductList(state, payload) {
            console.log("BatchUpdateProductList mutation is activated!");
            payload.productData.forEach(payloadproduct => {
                state.productsList = state.productsList.map(product => {
                    if (product.id == payloadproduct.id) {
                        if (payloadproduct.hasOwnProperty('active')) {
                            console.log('active found');
                            product.active = payloadproduct.active;
                        }
                        if (payloadproduct.hasOwnProperty('code')) {
                            console.log('product details found');
                            product.decription = payloadproduct.description;
                            product.isOutofStock = payloadproduct.isOutofStock;
                            product.name = payloadproduct.name;
                            product.price = payloadproduct.price;
                            product.resellerPrice = payloadproduct.resellerPrice;
                            product.sale = payloadproduct.sale;
                        }
                        if (payloadproduct.hasOwnProperty('downloadURL')) {
                            console.log('image url found');
                            product.pictureName = payloadproduct.pictureName;
                            product.downloadURL = payloadproduct.downloadURL;
                        }
                    }
                    return product;
                });
            });
        },
        
    },
    actions: {
        async FetchProductList({ commit }, payload) {
            try {
                const querySnapshot = await DB.collection('products')
                .where("categoryId", "==", payload)
                .get();
                const products = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    return data;
                });
                //console.log(products);
                commit('SetProductsList', products);
                Promise.resolve();
            } catch (error) {
                throw error;
            }
        },
        async AddProduct({ commit, dispatch }, payload) {
            try {
                const response = await DB.collection('products').add(payload.productData);
                console.log("RESPONSE ID: " + response.id);
                payload.productData.id = response.id;
                commit('AddProductsList', payload.productData);
                await dispatch('UpdateProduct', 
                    {
                        categoryId: payload.categoryId,
                        productId: payload.productData.id,
                        productData: payload.productData
                    }
                );
                Promise.resolve();
                return response.id;
            } catch (error) {
                throw error;
            }
        },
        async UpdateProduct({ commit }, payload) {
            try {
                await DB.collection('products')
                    .doc(payload.productId)
                    .update(payload.productData);
                commit('UpdateProductList', payload);
                Promise.resolve();
            } catch (error) {
                throw error;
            }
        },
        async BatchUpdateProduct({ commit }, payload) {
            try {
                console.log(payload);
                const batch = DB.batch();

                payload.productData.forEach(product => {
                    const ref = DB.collection('catalogues')
                        .doc(payload.catalogueId)
                        .collection('categories')
                        .doc(payload.categoryId)
                        .collection('products')
                        .doc(product.id)
                    batch.update(ref, product);
                });
                await batch.commit();
                commit('BatchUpdateProductList', payload);
                Promise.resolve();
            } catch (error) {
                throw error;
            }
        },
        async BatchAddProduct({ commit }, payload) {
            try {
                console.log(payload);
                const batch = DB.batch();

                payload.productData.forEach(product => {
                    const ref = DB.collection('catalogues')
                        .doc(payload.catalogueId)
                        .collection('categories')
                        .doc(payload.categoryId)
                        .collection('products')
                        .doc()
                    batch.set(ref, product);
                });
                await batch.commit();
                commit('BatchUpdateProductList', payload);
                Promise.resolve();
            } catch (error) {
                throw error;
            }
        },
        async CheckIfProductExists({ }, payload) {
            try {
                const querySnapshot = await DB.collection('products');
                let exists = false;
                //const promises = [];
                querySnapshot.where("code", "==", payload.code)
                .limit(1)
                .get()
                .then((productquerySnapshot) => {
                    if(!productquerySnapshot.empty) exists = true;
                });

                // querySnapshot.docs.forEach(product => {
                //     console.log(product);
                //     if (exists == false) {
                //         promises.push(DB.collection('products')
                //             .where("code", "==", payload.code)
                //             .limit(1)
                //             .get()
                //             .then((productquerySnapshot) => {
                //                 if (!productquerySnapshot.empty) {
                //                     exists = true;
                //                 }
                //             }
                //             )
                //         )
                //     }

                // })

                // console.log(promises);
                // await Promise.all(promises);
                return exists;

            } catch (error) {
                throw error;
            }
        },
        // async GET_CATEGORY_BY_COMPANY({ commit, dispatch }, companyId) {
        //     try {
        //         const querySnapshot = await DB.collection('catalogues').where('companyId', '==', companyId).get();
        //         const categories = querySnapshot.docs.map((doc) => {
        //             const data = doc.data();
        //             data.id = doc.id;
        //             return data;
        //         });
        //         return categories;
        //     } catch (error) {
        //         throw error;
        //     }
        // },
        // async UPDATE_CATEGORY_BY_KEY({ commit, dispatch }, payload) {
        //     try {
        //         const { categoryId, key, value } = payload;
        //         await DB.collection('catalogues').doc(categoryId).update({ [key]: value });
        //     } catch (error) {
        //         throw error;
        //     }
        // }
    }
}

export default products;
