import { DB } from '@/config/firebase';
import moment from 'moment';

const delivery_settings = {
    namespaced: true,
    state: {
        settings: {},
        discountList: [],
    },
    getters: {
        GET_DELIVERY_SETTINGS: state => state.settings,
        GET_DELIVERY_CUTOFF: state => state.setting.cutOffPrice,
        GET_DISCOUNT_LIST: state => state.discountList,
    },
    mutations: {
        SetSettings(state, payload) {
            state.settings = payload;
        },
        UpdateSettings(state, payload) {
            state.settings = payload.updatedDetails;
        },
        SetDiscountList(state, payload) {
            state.discountList = payload;
        },
        AddToDiscountList(state, payload) {
            state.discountList.push(payload);
            state.discountList = [...state.discountList];
        },
        UpdateToDiscountList(state, payload) {
            const index = state.discountList.findIndex(discount => discount.id === payload.id);
            if(index !== -1) {
                state.discountList[index] = Object.assign({}, payload);
                state.discountList = [...state.discountList];
            }
        },
        RemoveToDiscountList(state, id) {
            const index = state.discountList.findIndex(discount => discount.id === id);
            if(index !== -1) {
                state.discountList.splice(index, 1);
            }
        }
    },
    actions: {
        async GET_DELIVERY_SETTINGS({ commit }) {
            try {
                const response = await DB.collection('providers').doc('settings').get();
                commit('SetSettings', response.data());
            } catch (error) {
                throw error;
            }
        },

        async UPDATE_DELIVERY_SETTINGS({ commit }, payload) {
            try {
                await DB.collection('providers').doc('settings').update(payload.updatedDetails);
                commit('UpdateSettings', payload.updatedDetails);
            }
            catch (error) {
                console.log(error);
                throw error;
            }

        },

        async GET_DISCOUNT_LIST({ commit }) {
            try {   
                const discountListRef = await DB.collection('providers').doc('settings').collection('delivery_discount').get();
                const discounts = discountListRef.docs.map(discount => {
                    const data = discount.data();
                    data.id = discount.id;
                    return data;
                });

                commit('SetDiscountList', discounts);

            } catch(error) {
                throw error;
            }
        },

        async GET_DISCOUNT({}, payload) {
            try {
                const discountRef = await DB.collection('providers').doc('settings').collection('delivery_discount').doc(payload).get();
                const discount = discountRef.data();
                discount.id = discountRef.id;
                return discount;
            } catch(error) {
                throw error;
            }
        },

        async CHECK_IF_DISCOUNT_EXISTS({ state, commit }, payload) {
            const { id, region, province, city } = payload;
            let existingDiscount = false;

            try {
                for(const discount of state.discountList) {
                    if(
                        (discount.region === region && discount.province === province) &&
                        discount.city === city
                    ) {
                        existingDiscount = true;
                    
                    } else if(id && id !== discount.id) {
                        existingDiscount = true;
                    }
                }

                return existingDiscount;

            } catch(error) {
                throw error;
            }
        },

        async ADD_DISCOUNT({ commit }, payload) {
            try {
                const discount = await DB.collection('providers').doc('settings').collection('delivery_discount').add(payload);
                payload.id = discount.id;
                console.log(payload);
                commit('AddToDiscountList', payload);
            
            } catch(error) {
                throw error;
            }
        },

        async UPADTE_DISCOUNT({ commit }, payload) {
            const id = payload.id;
            delete payload.id;

            try {
                await DB.collection('providers').doc('settings').collection('delivery_discount').doc(id).update(payload);
                payload.id = id;
                commit('UpdateToDiscountList', payload);
            
            } catch(error) {
                throw error;
            }
        },

        async DELETE_DISCOUNT({ commit }, payload) {
            try {
                await DB.collection('providers').doc('settings').collection('delivery_discount').doc(payload).delete();
                commit('RemoveToDiscountList', payload);
            
            } catch(error) {
                throw error;
            }
        },
    }
}

export default delivery_settings;
