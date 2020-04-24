import { DB } from '@/config/firebase';
import axios from 'axios';

const lalamoveURL = process.env.lalamoveURL;

const lalamove = {
    namespaced: true,
    state: {
        quotationBody: {},
        orderConfirmation: {}
    },
    getters: {
        GET_QUOTATION_BODY: state => state.quotationBody,
        GET_ORDER_CONFIRMATION: state => state.orderConfirmation,
    },
    mutations: {
        SET_QUOTATION_BODY(state, payload) {
            state.quotationBody = payload;
        },
        SET_ORDER_CONFIRMATION(state, payload) {
            state.orderConfirmation = payload;
        }
    },
    actions: {
        attachQuotationBody({state}, payload) {
            let stockOrder = Object.assign({}, payload);
            stockOrder.quotationBody = Object.assign({}, state.quotationBody);
            return stockOrder;
        },

        async placeOrder({state, commit, dispatch}, payload) {
            const body = Object.assign({}, payload);
            console.log('lalamove quotation body: ', payload);
            
            try {
                let response = await axios({
                    method: 'post',
                    url: `${lalamoveURL}/placeOrder`,
                    data: body,
                });
                console.log("LALAMOVE PLACING ORDER RESPONSE: ", response);
                response = response.data;

                commit('SET_ORDER_CONFIRMATION', response);
                return response;
            }
            catch(error) {
                console.log("LALAMOVE PLACING ORDER RESPONSE ERROR: ", error);
                throw error;
            }
        },

        async getQuotation({state, commit, rootGetters}, payload) {
            commit('SET_QUOTATION_BODY', {});
            
            const pickUpAdd = await DB.collection('companyDetails').doc('address').get();
            let companyAdd = pickUpAdd.data().deliveryPickUp.replace(/ /g, "+");
            let response = await axios({
                method: 'get',
                url: `https://maps.googleapis.com/maps/api/geocode/json?address=${companyAdd}&key=AIzaSyAbCne97dfOmDY_xM01-awzqa95u2gyHvk`
            });

            let originCoordinates = {
                lat: response.data.results[0].geometry.location.lat,
                lon: response.data.results[0].geometry.location.lng
            }

            console.log("COMPANY ADDRESS ", originCoordinates);

            const user = rootGetters["accounts/user"];

            const address = user.address;
            let resellerAdd = `${address.streetName}, ${address.barangay}, ${address.citymun}, ${address.province}, ${address.zipCode}`;
            resellerAdd = resellerAdd.replace(/ /g, "+");

            let res = await axios({
                method: 'get',
                url: `https://maps.googleapis.com/maps/api/geocode/json?address=${resellerAdd}&key=AIzaSyAbCne97dfOmDY_xM01-awzqa95u2gyHvk`
            });
            
            let toAddress = {
                lat: res.data.results[0].geometry.location.lat,
                lon: res.data.results[0].geometry.location.lng,
            };

            console.log("RESELLER ADDRESS ", toAddress);

            //determine service type based on the items' weight
            let serviceType;
            payload.itemWeight = parseFloat(payload.itemWeight / 1000);
            if(payload.itemWeight <= 20.00) 
                serviceType = 'MOTORCYCLE';
            else if(payload.itemWeight > 20.00 && payload.itemWeight <= 300.00)
                serviceType = 'MPV';
            else 
                serviceType = 'VAN';

            let specialRequest = [];
            if(payload.paymentType === 'COD') {
                specialRequest.push('COD');
            }

            console.log(payload);
            // if(payload.stockOrder.paymentDetails.paymentType === 'COD')
            //     specialRequest.push("COD");

            const currentTime = new Date();
            const tomorrow = `${currentTime.getMonth() + 1}/${currentTime.getDate() + 1}/${currentTime.getFullYear()} 13:00:00`; 

            let companyNum = await DB.collection('companyDetails').doc('contact').get();
            companyNum = companyNum.data().mobileNum;

            const body = {
                'scheduleAt': new Date(tomorrow).toISOString(),
                'serviceType': serviceType,
                'specialRequests': specialRequest,
                'requesterContact': {
                    'name': process.env.companyName,
                    'phone': companyNum
                },
                'stops': [
                    {
                        'location': { 
                            'lat': originCoordinates.lat.toString(), 
                            'lng': originCoordinates.lon.toString()
                        },
                        'addresses': {
                            'en_PH': {
                                'displayString': companyAdd.replace(/[+]/g, " "),
                                'country': 'PH'
                            }
                        }
                    },
                    {
                        'location': { 
                            'lat': toAddress.lat.toString(), 
                            'lng': toAddress.lon.toString()
                        },
                        'addresses': {
                            'en_PH': {
                                'displayString': address.house + ", " + resellerAdd,
                                'country': 'PH'
                            }
                        }
                    },
                ],
                'deliveries': [
                    {
                        'toStop': 1,
                        'toContact': {
                            'name': `${user.firstName} ${user.lastName}`,
                            'phone': user.contact
                        },
                        'remarks': `STOCK ORDER: ${payload.stockOrder.stockOrderReference}`
                    }
                ]
            };

            try {
                let response = await axios({
                    method: 'post',
                    url: `${lalamoveURL}/getQuotation`,
                    data: body,
                });
                console.log("LALAMOVE QUOTATION RESPONSE: ", response);
                response = response.data;

                body.quotedTotalFee = {
                    'amount': response.totalFee,
                    'currency': 'PH'
                };
                body.sms = true;

                commit('SET_QUOTATION_BODY', body);
                return response;
            }
            catch(error) {
                console.log("LALAMOVE QUOTATION RESPONSE ERROR: ", error);
                throw error;
            }
        },

        async getOrderStatus({state, commit, dispatch}, payload) {
            const { customerOrderId, orderRef } = payload;
           
            try {
                let response = await axios({
                    method: 'get',
                    url: `${lalamoveURL}/getOrderStatus`,
                    params: {
                        orderRef : orderRef
                    }
                });
                console.log('LALAMOVE GET ORDER STATUS:', response.data);
                response = response.data;
                
                if(response.status === 'CANCELED') {
                    response.status = 'CANCELLED';
                }

                return response;
            }
            catch(error) {
                console.log('LALAMOVE GET ORDER STATUS ERROR', error);
                throw error;
            }
        },

        async cancelOrder({commit}, payload) {
            const { customerOrderId, orderRef } = payload;
            try {
                let response = await axios({
                    method: 'put',
                    url: `${lalamoveURL}/cancelOrder`,
                    params: {
                        orderRef: orderRef
                    }
                });
                console.log('LALAMOVE CANCEL ORDER STATUS:', response);
                response = response.data;

                return {
                    isSuccessful: true
                };
            }
            catch(error) {
                console.log('LALAMOVE CANCEL ORDER STATUS ERROR', error);
                throw error;
            }
        }
    }
}

export default lalamove;