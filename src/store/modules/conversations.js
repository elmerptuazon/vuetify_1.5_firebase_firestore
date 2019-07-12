import { DB, AUTH } from '@/config/firebase';

const messages = {
	namespaced: true,
	state: {
	},
	getters: {
	},
	mutations: {
	},
	actions: {
		async GET_CONVERSATIONS({ rootState, dispatch }, payload) {
			try {
				const convoRef = DB.collection('conversations');
				//const userId = AUTH.currentUser.uid;
				const userId = "admin";
				const convoQuerySnapshot = await convoRef
					.where('users', 'array-contains', "admin")
					.orderBy('updated', 'desc')
					.get();

				const conversations = convoQuerySnapshot.docs.map((doc) => {
					const data = doc.data();
					data.id = doc.id;
					return data;
				});

				for (const c of conversations) {
					const userIndex = c.users.findIndex(user => user !== userId);
					c.user = await dispatch('auth/GET_USER', c.users[userIndex], { root: true });
				}
				// console.log("test");
				// console.log(conversations);
				return conversations;

			} catch (error) {
				throw error;
			}
		},
		// async GET_MESSAGES({ rootState }, conversationId) {
		// 	try {
		// 		const messageRef = DB.collection('messages');
		// 		const userId = AUTH.currentUser.uid;

		// 		const querySnapshot = await messageRef
		// 			.where('conversationId', '==', conversationId)
		// 			.get();

		// 		const messages = querySnapshot.docs.map((doc) => {
		// 			const data = doc.data();
		// 			data.id = doc.id;
		// 			return data;
		// 		});

		// 		messages.forEach((m) => {
		// 			if (m.sender === userId) {
		// 				m.you = true;
		// 			} else {
		// 				m.you = false;
		// 			}
		// 		});

		// 		return messages;
		// 	} catch (error) {
		// 		throw error;
		// 	}
		// },
		// async GET_LAST_MESSAGE({ }, conversationId) {
		// 	const messageRef = DB.collection('messages');
		// 	try {
		// 		const querySnapshot = await messageRef
		// 			.where('conversationId', '==', conversationId)
		// 			.orderBy('created', 'desc').limit(1)
		// 			.get();

		// 		const messages = querySnapshot.docs.map((doc) => {
		// 			const data = doc.data();
		// 			data.id = doc.id;
		// 			return data;
		// 		});
		// 	} catch (error) {
		// 		throw error;
		// 	}
		// },
		async ADD_CONVERSATION({ rootState }, payload) {
			const conversationsRef = DB.collection('conversations');
			const userId = AUTH.currentUser.uid;
			const { distributorId, sendMessage } = payload;

			try {
				const d = Date.now();
				const response = await conversationsRef.add({
					created: d,
					updated: d,
					users: ["admin", distributorId],
					opened: {
						["admin"]: false,
						[distributorId]: false
					}
				});

				return response;
			} catch (error) {
				throw error;
			}
		},
		async SEND_MESSAGE({ rootState }, payload) {
			const messagesRef = DB.collection('messages');
			const conversationsRef = DB.collection('conversations');
			const userId = AUTH.currentUser.uid;

			try {
				const obj = {
					conversationId: payload.conversationDetails.id,
					created: Date.now(),
					sender: "admin"
				}

				if (payload.attachment) {
					obj.attachment = true;
					obj.url = payload.url;
				} else {
					obj.text = payload.text;
				}

				const doc = await messagesRef.add(obj);

				const opened = {
					["admin"]: true,
					[payload.conversationDetails.user.id]: false
				}

				await conversationsRef.doc(payload.conversationDetails.id).update({
					opened: opened,
					updated: Date.now()
				});

				return doc;
			} catch (error) {
				throw error;
			}
		},
		async CHECK_IF_EXISTS({ rootState, dispatch }, distributorId) {
			const convoRef = DB.collection('conversations');
			const userId = AUTH.currentUser.uid;

			try {
				const convoQuerySnapshot = await convoRef
					.where('users', '==', [distributorId, userId])
					.get();

				const conversations = convoQuerySnapshot.docs.map((doc) => {
					const data = doc.data();
					data.id = doc.id;
					return data;
				});

				if (conversations.length > 0) {
					return conversations;
				} else {
					try {
						const convoQuerySnapshot2 = await convoRef
							.where('users', '==', [userId, distributorId])
							.get();

						const conversations2 = convoQuerySnapshot2.docs.map((doc) => {
							const data = doc.data();
							data.id = doc.id;
							return data;
						});

						return conversations2;
					} catch (error) {
						throw error;
					}
				}
			} catch (error) {
				throw error;
			}

		},
		async OPEN_UNREAD({ rootState }, id) {
			const conversationsRef = DB.collection('conversations');
			const userId = rootState.auth.user.id;

			try {
				await conversationsRef.doc(id).update({ [`opened.admin`]: true });
			} catch (error) {
				throw error;
			}
		}
	}
}

export default messages;
