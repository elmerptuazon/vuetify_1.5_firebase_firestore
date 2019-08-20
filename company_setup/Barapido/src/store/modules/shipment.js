import { DB } from '@/config/firebase';

function GenerateTrackingNumber() {
    var refNumber = `PHTN${BigInt(Date.now()).toString(36).toUpperCase()}`;
    return refNumber;
}

const shipment = {
    namespaced: true,
    state: {
        shipmentList: []
    },
    getters: {
    },
    mutations: {
        SetShipment(state, payload) {
            state.shipmentList.push(payload);
        }
    },
    actions: {
        async SubmitShipment({ commit }, payload) {
            try {
                payload.trackingNumber = GenerateTrackingNumber();
                const response = await DB.collection('shipment').add(payload);
                commit('SetShipment', payload)
                return response;
            } catch (error) {
                throw error;
            }
        },

    }
}

export default shipment;
