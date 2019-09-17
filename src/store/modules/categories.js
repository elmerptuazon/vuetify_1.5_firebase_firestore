import {DB} from '@/config/firebase';

const categories = {
	namespaced: true,
	state: {
        categoryList: [],
    },
	getters: {
    },
	mutations: {
        SetCategoryList(state, payload) {
            state.categoryList = payload;
        },
        AddCategoryList(state, payload) {
            state.categoryList.push(payload);
        },
        UpdateCategoryList(state, payload) {
            state.categoryList = state.categoryList.map(category => {
                if (category.id == payload.categoryId) {
                    if (payload.categoryData.hasOwnProperty('active')) {
                        console.log('active found');
                        category.active = payload.categoryData.active;
                    }
                    if (payload.categoryData.hasOwnProperty('name')) {
                        console.log('name found');
                        category.name = payload.categoryData.name;
                    }
                    if (payload.categoryData.hasOwnProperty('downloadURL')) {
                        console.log('image url found');
                        category.pictureName = payload.categoryData.pictureName;
                        category.downloadURL = payload.categoryData.downloadURL;
                    }
                }
                return category;
            });
        },
    },
	actions: {
        async FETCH_CATEGORIES ({ commit, dispatch }) {
            try {
                const querySnapshot = await DB.collection('catalogues').get();
                const categories = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    return data;
                });
                //return categories;
                commit('SetCategoryList', categories);
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
        async ADD_CATEGORY({ commit }, payload) {
            try {
                const response = await DB.collection('catalogues').add(payload.categoryData);
                payload.categoryData.id = response.id;
                commit('AddCategoryList', payload.categoryData);
                return response;
            } catch (error) {
                throw error;
            }
        },
        async UPDATE_CATEGORY({ commit }, payload) {
            try {
                await DB.collection('catalogues')
                    .doc(payload.categoryId)
                    .update(payload.categoryData);
                commit('UpdateCategoryList', payload);
                Promise.resolve();
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
