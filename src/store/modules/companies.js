import {DB} from '@/config/firebase';

const companies = {
	namespaced: true,
	state: {
        companies: []
    },
	getters: {
        GET_COMPANIES: state => state.companies
    },
	mutations: {
        SET_COMPANIES (state, payload) {
            state.companies = payload;
        }
    },
	actions: {
        async GET_COMPANIES ({commit, dispatch}, payload) {
            try {
                const querySnapshot = await DB.collection('companies').get();
                const companies = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    return data;
                });

                commit('SET_COMPANIES', companies);
                return companies;
            } catch (error) {
                throw error;
            }
        },
        async FIND_COMPANY ({commit, dispatch}, companyId) {
            try {
                const snapshot = await DB
                .collection('companies')
                .doc(companyId)
                .get();

                const data = snapshot.data();
                data.id = companyId;

                return data;
            } catch (error) {
                throw error;
            }
        },
        async UPDATE_COMPANY_BY_KEY ({commit, dispatch}, payload) {
			try {
				const { companyId, key, value } = payload;
                await DB.collection('companies').doc(companyId).update({ [key]: value });
            } catch (error) {
                throw error;
            }
        }
    }
}

export default companies;
