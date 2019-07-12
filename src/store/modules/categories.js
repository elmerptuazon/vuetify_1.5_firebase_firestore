import {DB} from '@/config/firebase';

const categories = {
	namespaced: true,
	state: {
    },
	getters: {
    },
	mutations: {
    },
	actions: {
        async GET_CATEGORIES ({ commit, dispatch }) {
            try {
                const querySnapshot = await DB.collection('catalogues').get();
                const categories = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    return data;
                });
                return categories;
            } catch (error) {
                throw error;
            }
        },
        async GET_CATEGORY_BY_COMPANY ({ commit, dispatch }, companyId) {
            try {
                const querySnapshot = await DB.collection('catalogues').where('companyId', '==', companyId).get();
                const categories = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    return data;
                });
                return categories;
            } catch (error) {
                throw error;
            }
        },
        async UPDATE_CATEGORY_BY_KEY ({commit, dispatch}, payload) {
			try {
				const { categoryId, key, value } = payload;
                await DB.collection('catalogues').doc(categoryId).update({ [key]: value });
            } catch (error) {
                throw error;
            }
        }
    }
}

export default categories;
