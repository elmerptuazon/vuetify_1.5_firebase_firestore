import { DB, AUTH } from '@/config/firebase';
import moment from 'moment';
function GenerateTrackingNumber() {
    var refNumber = `PHTN${BigInt(Date.now()).toString(36).toUpperCase()}`;
    return refNumber;
}

const shipment = {
    namespaced: true,
    state: {
        shipmentList: [],
        shipments: [],
        subscriber: null,
    },
    getters: {
        GET_SHIPMENTS: state => state.shipments,
    },
    mutations: {
        AddShipment(state, payload) {
            state.shipmentList.unshift(payload);
        },
        AddToShipments(state, payload) {
            state.shipments.unshift(payload);
        },
        SetShipments(state, payload) {
            state.shipmentList = payload;
        },
        ClearShipmentList(state, payload) {
            state.shipmentList = [];
        },
        ClearShipments(state) {
            state.shipments = [];
        },
        UpdateShipment(state, payload) {
            console.log(state.shipmentList)
            let shipmentIndex = state.shipmentList.findIndex(shipment => { return shipment.id == payload.id })
            console.log(shipmentIndex);
            if(shipmentIndex !== -1) {
                Object.keys(payload.updatedDetails).forEach((key) => {
                    state.shipmentList[shipmentIndex][key] = payload.updatedDetails[key];
                });
            }
            // key: the name of the object key
            // index: the ordinal position of the key within the object 
        },
        UpdateToShipments(state, payload) {
            const index = state.shipments.findIndex((shipment) => shipment.id === payload.id);
            if(index !== -1) {
                Object.keys(payload.updatedDetails).forEach((key) => {
                    state.shipments[index][key] = payload.updatedDetails[key];
                });
            }
        },
        RemoveToShipments(state, payload) {
            const index = state.shipments.findIndex((shipment) => shipment.id === payload.id);
            if(index !== -1) {
                state.shipments.splice(index, 1);
            }
        }
    },
    actions: {
        LISTEN_TO_SHIPMENTS({ state, commit }) {
            commit('ClearShipments');
            state.subscriber = DB.collection('shipment')
                .orderBy('dateSubmitted', 'asc')
                .onSnapshot((snapshot) => {
                    console.log('listening to shipments...');

                    let changes = snapshot.docChanges();
                    
                    changes.forEach(change => {
                        const data = change.doc.data();
                        data.id = change.doc.id;
                        
                        switch(change.type) {
                            case 'added': {
                                console.log('added a shipment', data);

                                if(!state.shipments.length) {
                                    console.log('added a shipment', data);
                                    commit('AddToShipments', data);
                                
                                //This will avoid adding the same shipment to the list
                                //especialy when adding a new shipment
                                } else {
                                    const lastAddedShipment = state.shipments[0];
                                    if(lastAddedShipment.id !== data.id) {
                                        console.log('added a shipment', data);
                                        commit('AddToShipments', data);
                                    }
                                }
                                break;
                            }

                            case 'modified': {
                                console.log('modified shipment: ', data);
                                
                                commit('UpdateToShipments', {
                                    id: data.id,
                                    updatedDetails: data
                                });

                                break;
                            }

                            case 'removed': {
                                console.log('removed shipment: ', data);
                                commit('RemoveToShipments', data);

                                break;
                            }

                            default: {
                                console.log('shipment type not recognized: ', change.type);
                                console.log('shipment: ', data);
                            }
                        
                        }
                    })
                });
        },

        UNSUBSCRIBE_TO_SHIPMENTS({state}) {
            if(state.subscriber) {
                state.subscriber();
            }
        },

        async SubmitShipment({ commit }, payload) {
            try {
                payload.trackingNumber = GenerateTrackingNumber();
                const response = await DB.collection('shipment').add(payload);
                // payload.id = response.id;
                // commit('AddShipment', payload)
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
                const fromDate = new Date(moment(payload.dateRange.fromDate).startOf("day"));
                const millisecondFromConvertion = fromDate.getTime();
                const toDate = new Date(moment(payload.dateRange.toDate).endOf("day"));
                const millisecondToConvertion = toDate.getTime();
                const filter = payload.filter === "Pick-Up Date" ? "pickupDate" : "dateSubmitted";
                const shipmentSnapshot = await DB.collection('shipment').where(filter, ">=", millisecondFromConvertion).where(filter, "<=", millisecondToConvertion).get();
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

        async GetSingleShipment({}, payload) {
            let response;
            try {
                response = await DB.collection('shipment').doc(payload).get();
                return response.data();
            }
            catch(error) {
                throw error.response;
            }
        },
        
        async UpdateShipment({ commit, dispatch }, payload) {
            try {
                console.log(payload);
                await DB.collection('shipment').doc(payload.id).update(payload.updatedDetails);
                // commit('UpdateShipment', payload)

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
