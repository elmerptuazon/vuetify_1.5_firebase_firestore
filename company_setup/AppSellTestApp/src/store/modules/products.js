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
                        product.minimumOrder = payloadproduct.minimumOrder;
                        product.weight = payloadproduct.weight;
                        product.sale = payloadproduct.sale;
                        product.position = payloadproduct.position;
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
                            product.minimumOrder = payloadproduct.minimumOrder;
                            product.sale = payloadproduct.sale;
                            product.position = payloadproduct.position;
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
        async FETCH_PRODUCTS({ commit }, payload) {
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
        async ADD_PRODUCT({ commit, dispatch }, payload) {
            try {
                const response = await DB.collection('products').add(payload.productData);
                console.log("RESPONSE ID: " + response.id);
                payload.productData.id = response.id;
                commit('AddProductsList', payload.productData);
                Promise.resolve();
                return response.id;
            } catch (error) {
                throw error;
            }
        },
        async UPDATE_PRODUCT({ commit }, payload) {
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
        async CheckIfProductExists({ }, payload) {
            try {
                //const promises = [];
                const snapshot = await DB.collection('products')
                    .where("code", "==", payload.code)
                    .limit(1)
                    .get();

                //if there is no returned doc, it means there's no product  
                //that exist as same as the code being checked
                if (snapshot.empty) return false;
                else return true;
            } catch (error) {
                throw error;
            }
        },
        async UPDATE_PRODUCT_BY_KEY({ commit, dispatch }, payload) {
            try {
                const { productId, key, value } = payload;
                await DB.collection('products').doc(productId).update({ [key]: value });
            } catch (error) {
                throw error;
            }
        }
    }
}

export default products;
