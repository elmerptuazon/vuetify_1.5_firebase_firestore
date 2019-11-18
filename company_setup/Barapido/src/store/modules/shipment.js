import { DB } from '@/config/firebase';
import moment from 'moment';
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
        AddShipment(state, payload) {
            state.shipmentList.unshift(payload);
        },
        SetShipments(state, payload) {
            state.shipmentList = payload;
        },
        ClearShipmentList(state, payload) {
            state.shipmentList = [];
        },
        UpdateShipment(state, payload) {
            console.log(state.shipmentList)
            let shipmentIndex = state.shipmentList.findIndex(shipment => { return shipment.id == payload.id })
            console.log(shipmentIndex);
            Object.keys(payload.updatedDetails).forEach((key) => {
                state.shipmentList[shipmentIndex][key] = payload.updatedDetails[key];
            });
            // key: the name of the object key
            // index: the ordinal position of the key within the object 
        }
    },
    actions: {
        async SubmitShipment({ commit }, payload) {
            try {
                payload.trackingNumber = GenerateTrackingNumber();
                const response = await DB.collection('shipment').add(payload);
                payload.id = response.id;
                commit('AddShipment', payload)
                return response;
            } catch (error) {
                throw error;
            }
        },

        async GetShipments({ commit }, payload) {
            try {
                commit('ClearShipmentList');
                const shipmentSnapshot = await DB.collection('shipment').where("stockOrder.stockOrderId", "==", payload).orderBy("dateSubmitted", "desc").get();
                console.log(shipmentSnapshot)
                if (!shipmentSnapshot.empty) {
                    const shipmentList = shipmentSnapshot.docs.map((shipment) => {
                        let shipmentDetails = shipment.data();
                        shipmentDetails.id = shipment.id;
                        return shipmentDetails;
                    })
                    commit('SetShipments', shipmentList);
                }
            }
            catch (error) {
                console.log(error);
                throw error;
            }

        },

        async GetShipmentsByDate({ commit }, payload) {
            try {
                commit('ClearShipmentList');
                const fromDate = new Date(moment(payload.fromDate).startOf("day"));
                const millisecondFromConvertion = fromDate.getTime();
                const toDate = new Date(moment(payload.toDate).endOf("day"));
                const millisecondToConvertion = toDate.getTime();
                const shipmentSnapshot = await DB.collection('shipment').where("dateSubmitted", ">=", millisecondFromConvertion).where("dateSubmitted", "<=", millisecondToConvertion).get();
                console.log(shipmentSnapshot)
                if (!shipmentSnapshot.empty) {
                    const shipmentList = shipmentSnapshot.docs.map((shipment) => {
                        return shipment.data();
                    })
                    commit('SetShipments', shipmentList);
                }
            }
            catch (error) {
                console.log(error);
                throw error;
            }

        },
        async UpdateShipment({ commit, dispatch }, payload) {
            try {
                console.log(payload);
                await DB.collection('shipment').doc(payload.id).update(payload.updatedDetails);
                commit('UpdateShipment', payload)

                // await dispatch(
                //     "stock_orders/UPDATE_STOCK_ORDER_DETAILS",
                //     {
                //         updateObject: payload.updatedStockOrderDetails,
                //         referenceID: payload.stockOrderID
                //     }, { root: true }
                // );

            } catch (error) {
                throw error;
            }
        },

    }
}

export default shipment;
