import { DB } from '@/config/firebase';
import moment from 'moment';

const delivery_settings = {
    namespaced: true,
    state: {
        settings: {}
    },
    getters: {
        GET_DELIVERY_SETTINGS: state => state.settings,
        GET_DELIVERY_CUTOFF: state => state.setting.cutOffPrice,
    },
    mutations: {
        SetSettings(state, payload) {
            state.settings = payload;
        },
        UpdateSettings(state, payload) {
            state.settings = payload.updatedDetails;
        }
    },
    actions: {
        async GetDeliverySettings({ commit }) {
            try {
                const response = await DB.collection('providers').doc('settings').get();
                commit('SetSettings', response.data());
            } catch (error) {
                throw error;
            }
        },

        async UpdateDeliverySettings({ commit }, payload) {
            try {
                await DB.collection('providers').doc('settings').update(payload.updatedDetails);
                commit('UpdateSettings', payload.updatedDetails);
            }
            catch (error) {
                console.log(error);
                throw error;
            }

        },
    }
}

export default delivery_settings;
