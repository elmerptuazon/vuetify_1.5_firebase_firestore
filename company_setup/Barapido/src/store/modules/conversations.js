import { DB, AUTH } from '@/config/firebase';

const messages = {
	namespaced: true,
	state: {
		convoSubscriber: null,
		messageSubscriber: null,
		conversationsList: [],
		messagesList: [],
	},
	getters: {
		GET_CONVERSATIONS_LIST(state) {
			return state.conversationsList;
		},
		GET_MESSAGES_LIST: state => state.messagesList,
		GET_NEW_MESSAGES_COUNT(state) {
			const conversations = state.conversationsList.filter(convo => convo.user.status === 'approved');
			//filter the conversationsList array with conversation that is not yet opened by the admin
			const unreadConversations = conversations.filter((conversation) => {
					return conversation.opened.admin === false;
			});
			return unreadConversations.length;
		}
	},
	mutations: {
		AddToConversations(state, payload) {
			state.conversationsList.push(payload);
			console.log('added convo', payload);
		},
		RemoveToConversations(state, payload) {
			const index = state.conversationsList.findIndex(convo => convo.id === payload.id);
			if(index !== -1) {
				state.conversationsList.splice(index, 1);
			}
		},
		UpdateToConversations(state, payload) {
			const index = state.conversationsList.findIndex(convo => convo.id === payload.id);
			if(index !== -1) {
				Object.keys(payload).forEach((key) => {
					state.conversationsList[index][key] = payload[key];
				});
				console.log('modified convo: ', payload);
			}
		}
	},
	actions: {
		async listenToConversations({ state, rootState, dispatch, commit }) {
			console.log('listening to conversations');
			const user = rootState.auth.user;
			state.conversationsList = [];
	  
			state.convoSubscriber = DB.collection("conversations")
			  .where("users", "array-contains", "admin")
			  .orderBy('updated', 'desc')
			  .onSnapshot(snapshot => {
	  
				snapshot.docChanges().forEach(async change => {
				  const data = change.doc.data();
				  data.id = change.doc.id;
	  
				  if (change.type === "added") {
					const userIndex = data.users.findIndex(u => u !== user.id);
					data.user = await dispatch(
					  "auth/GET_USER",
					  data.users[userIndex],
					  { root: true }
					);
					
					commit('AddToConversations', data);

				  } else if (change.type === "modified") {
					const userIndex = data.users.findIndex(u => u !== user.id);
					data.user = await dispatch(
					  "auth/GET_USER",
					  data.users[userIndex],
					  { root: true }
					);

					commit('UpdateToConversations', data);
				  }
				});
			});
		},

		async listenToNewMessages({ state, commit, rootState, dispatch }, conversation) {
			const user = rootState.auth.user;
			const asker = conversation.user.id;

			state.messagesList = [];

			state.messageSubscriber = DB.collection("messages")
			  .where("conversationId", "==", conversation.id)
			  .onSnapshot(snapshot => {
	  
				snapshot.docChanges().forEach(change => {
					
					const data = change.doc.data();
					data.id = change.doc.id;
					console.log('message: ', change, data);

					if (change.type === "added") {
						if (asker == data.sender) {
							data.you = false;
						} else if (data.sender == "admin") {
							data.you = true;
						}
						console.log(data);
						
						if(state.messagesList.length) {
							//dont push messages that is similar to the last entry message in the messageList
							const lastIndex = state.messagesList.length - 1;
							const lastMessage = state.messagesList[lastIndex];
							if(lastMessage.id !== data.id) {
								state.messagesList.push(data);
							}
						
						} else {
							state.messagesList.push(data);
						}
						
					}
				});
			});
		},

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
				
				let filteredConversation = conversations.filter(conversation => {
					return conversation.user.status == "approved"
				})
				// console.log(conversations);

				return filteredConversation;

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
