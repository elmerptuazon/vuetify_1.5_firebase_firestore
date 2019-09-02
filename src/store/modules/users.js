import { DB, AUTH, COLLECTION } from '@/config/firebase';
const usersCollection = DB.collection("accounts");
const users = {
  namespaced: true,
  state: {
    resellers: [],
    customers: [],
  },
  getters: {

  },
  mutations: {
    SetResellers(state, payload) {
      state.resellers = payload;
    },
    SetCustomers(state, payload) {
      state.customers = payload;
    },
  },
  actions: {
    async GetCustomers({ commit }) {
      try {
        const querySnapshot = await usersCollection
          .where("type", "==", "Customer")
          .get();
        const customers = querySnapshot.docs.map(doc => {
          const data = doc.data();
          data.id = doc.id;
          return data;
        });

        for (let customer of customers) {
          if (typeof customer.resellerId != "undefined") {
            const resellerSnapshot = await usersCollection.doc(customer.resellerId).get();
            customer.resellerData = resellerSnapshot.data();
          }

        }
        //console.log(customers);
        commit('SetCustomers', customers);

      } catch (error) {
        console.log(error);
      }
    },
    async ConvertCustomer({ commit, dispatch }, payload) {
      try {
        await usersCollection.doc(payload.id).update({
          type: "Reseller",
          agentId: payload.agentId,
          status: "approved"
        })
        await dispatch('GetCustomers');
        await DB.collection('conversations').add({
          created: Date.now(),
          updated: Date.now(),
          opened: {
            [payload.id]: false,
            ["admin"]: false
          },
          users: [payload.id, "admin"]
        });

      } catch (error) {
        console.log(error);
      }


    }
  }
}

export default users;
