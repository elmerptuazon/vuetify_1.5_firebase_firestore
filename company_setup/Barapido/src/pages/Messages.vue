<template>
  <v-container fluid>
    <NewMessageDialog
      ref="NewMessageDialog"
      @viewConversation="viewConversationFromDialog"
    />

    <v-card>
      <v-card-title>
        <div class="headline">Messages</div>
        <v-spacer></v-spacer>
        <!-- <v-btn icon color="primary" @click.stop="openNewMessageDialog">
          <v-icon>create</v-icon>
        </v-btn> -->
      </v-card-title>
      <v-divider></v-divider>
      <v-card height="85vh" flat>
        <div class="text-xs-center mt-3" v-if="conversationsLoading">
          <v-progress-circular
            :size="150"
            :width="5"
            color="primary"
            indeterminate
            v-if="conversationsLoading"
          ></v-progress-circular>
        </div>
        <v-layout row wrap v-else>
          <v-flex xs5>
            <div id="conversation-container">
              <v-layout my-1 align-center justify-center wrap>
                <v-flex xs12 mt-2>
                  <v-text-field
                    v-model="search"
                    clearable
                    outline dense
                    height="1"
                    single-line
                    class="px-2 mt-2"
                    placeholder="search reseller..."
                    prepend-inner-icon="search"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12><v-divider></v-divider></v-flex>
                <v-flex xs12 mt-3 v-if="!items.length && search">
                  <div class="subheading red--text text-xs-center font-weight-bold">
                    No user is related to your search...
                  </div>
                </v-flex>
              </v-layout>
              <v-list class="pa-0">
                <template v-for="i in orderBy(items, 'updated', -1)">
                  <v-list-tile
                    :class="[i.selected ? 'blue lighten-3' : '']"
                    avatar
                    @click="viewConversation(i)"
                    :key="i.id"
                  >
                    <v-list-tile-avatar>
                      <v-img
                        :src="i.user.downloadURL"
                        v-if="i.user.downloadURL"
                      ></v-img>
                      <v-img :src="userPlaceholder" v-else></v-img>
                    </v-list-tile-avatar>

                    <v-list-tile-content>
                      <v-list-tile-title
                        :class="[
                          !i.opened[userId] ? 'blue--text strong-text' : ''
                        ]"
                        >{{ i.user.firstName }}
                        {{ i.user.middleInitial || "" }}
                        {{ i.user.lastName }}</v-list-tile-title
                      >
                    </v-list-tile-content>

                    <v-list-tile-action v-show="!i.opened[userId]">
                      <v-icon color="primary">fiber_manual_record</v-icon>
                    </v-list-tile-action>
                  </v-list-tile>
                </template>
              </v-list>
            </div>
          </v-flex>

          <v-flex xs7>
            <div class="text-xs-center mt-5" v-if="loading">
              <v-progress-circular
                :size="150"
                :width="5"
                color="primary"
                indeterminate
              ></v-progress-circular>
            </div>

            <div id="selected-conversation-header" v-show="!loading">
              <div
                style="font-size: 18px;"
                class="text-xs-right strong-text pt-2 pr-3"
                v-if="selectedConversation.user"
              >
                <span>{{ selectedConversation.user | toFullName }}</span>
                <v-avatar
                  v-if="selectedConversation.user"
                  size="40"
                  class="ml-2"
                >
                  <v-img
                    :src="selectedConversation.user.downloadURL"
                    v-if="selectedConversation.user.downloadURL"
                  ></v-img>
                  <v-img :src="userPlaceholder" v-else></v-img>
                </v-avatar>
              </div>
            </div>

            <v-divider v-show="!loading"></v-divider>

            <div id="messages-container" class="pa-2" v-show="!loading">
              <div
                v-for="m in orderBy(messages, 'created')"
                class="message-container"
                :key="m.id"
              >
                <div
                  v-if="m.attachment"
                  style="width: 200px;"
                  :class="[m.you ? 'you my-2' : 'not-you my-2']"
                >
                  <v-img :src="m.url" contain max-width="200"></v-img>
                </div>
                <v-card
                  v-else
                  flat
                  class="message"
                  :class="[
                    m.you
                      ? 'you primary white--text'
                      : 'not-you grey lighten-2 grey--text text--darken-3'
                  ]"
                >
                  <v-card-text class="pa-2">
                    <div>{{ m.text }}</div>
                  </v-card-text>
                </v-card>
              </div>
            </div>

            <div id="text-container" class="pa-1" v-show="!loading">
              <input
                type="file"
                ref="file"
                v-show="false"
                @change="sendAttachment"
              />
              <v-textarea
                prepend-inner-icon="insert_photo"
                @click:prepend-inner="$refs.file.click()"
                @focus="markConvoAsRead"
                v-model="text"
                placeholder="Type a message..."
                hint='Press "enter" to send this message..."shift" + "enter" to insert new line'
                outline round
                rows="1" rows-height="1"
                single-line 
                class="px-2 py-2 mb-2"
                append-outer-icon="send"
                @click:append-outer="sendMessage"
                @keyup.enter.exact="sendMessage"
              ></v-textarea>
            </div>
          </v-flex>
        </v-layout>
      </v-card>
    </v-card>

    <v-dialog v-model="loadingDialog" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Sending attachment...
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import userPlaceholder from "@/assets/placeholder.png";
import NewMessageDialog from "@/components/NewMessageDialog";
import { DB, STORAGE } from "@/config/firebase";
import { downScaleImageFromFile } from "@/helpers/helpers";
import { mapState } from "vuex";
import uuidv4 from "uuid/v4";

export default {
  data: () => ({
    // items: [],
    selectedConversation: {},
    loading: false,
    search: '',
    // messages: [],
    text: null,
    conversationsLoaded: false,
    conversationsListener: null,
    messagesListener: null,
    conversationsLoading: false,
    loadingDialog: false
  }),
  async created() {
    // this.conversationsLoading = true;
    // this.listenToConversations();

    // console.log(this.items);

    if (this.items.length > 0) {
      await this.viewConversation(this.items[0]);
      this.conversationsLoaded = true;
    }

    // try {
    //   const conversations = await this.$store.dispatch(
    //     "conversations/GET_CONVERSATIONS"
    //   );

    //   this.items = conversations;

      
    // } catch (error) {
    //   console.log(error);
    // }
    // this.conversationsLoading = false;
  },
  methods: {
    async markConvoAsRead() {
      await this.$store.dispatch("conversations/OPEN_UNREAD", this.selectedConversation.id);
    },

    async viewConversation(item) {
      console.log(item);

      // if (this.messagesListener) {
      //   this.messagesListener();
      //   this.messagesListener = null;
      // }

      this.selectedConversation = item;
      this.loading = true;

      this.search = '';

      await this.$store.dispatch("conversations/listenToNewMessages", item);
      await this.$store.dispatch("conversations/OPEN_UNREAD", item.id);
      
      this.scrollDown();
      this.loading = false;
      
    },

    viewConversationFromDialog(conversationId) {
      const index = this.items.findIndex(item => item.id === conversationId);
      this.viewConversation(this.items[index]);
    },

    async sendMessage(e) {
      if (!this.text) {
        return;
      }

      const messageText = this.text;
      this.text = null;

      try {
        const response = await this.$store.dispatch(
          "conversations/SEND_MESSAGE",
          {
            conversationDetails: this.selectedConversation,
            text: messageText
          }
        );

        this.text = null;
      } catch (error) {
        console.log(error);
      }
    },
    // listenToConversations() {
      // const user = this.$store.getters["auth/GET_USER"];

      // this.conversationsListener = DB.collection("conversations")
        // .where("users", "array-contains", "admin")
        // .onSnapshot(snapshot => {
          // if (!this.conversationsLoaded) {
            // return;
          // }

          // snapshot.docChanges().forEach(async change => {
            // const data = change.doc.data();
            // data.id = change.doc.id;

            // if (change.type === "added") {
              // const userIndex = data.users.findIndex(u => u !== user.id);
              // data.user = await this.$store.dispatch(
                // "auth/GET_USER",
                // data.users[userIndex]
              // );
              // this.items.push(data);
            // } else if (change.type === "modified") {
              // const conversationIndex = this.items.findIndex(
                // c => c.id === data.id
              // );
              // if (conversationIndex !== -1) {
                // this.items[conversationIndex].updated = data.updated;
                // this.items[conversationIndex].opened = data.opened;

                // if (this.selectedConversation.id === data.id) {
                  // this.items[conversationIndex].opened[user.id] = true;
                // }
              // }
            // }
          // });
        // });
    // },

    // listenToNewMessages(conversation) {
      // const user = this.$store.getters["auth/GET_USER"];
      // const asker = conversation.user.id;
      // this.messagesListener = DB.collection("messages")
        // .where("conversationId", "==", conversation.id)
        // .onSnapshot(snapshot => {
          // this.loading = false;

          // snapshot.docChanges().forEach(change => {
            // const data = change.doc.data();
            // data.id = change.doc.id;

            // if (change.type === "added") {
              // if (asker == data.sender) {
                // data.you = false;
              // } else if (data.sender == "admin") {
                // data.you = true;
              // }
              // console.log(data);
              // this.messages.push(data);
              // this.scrollDown();
            // }
          // });
        // });
    // },

    async sendAttachment() {
      if (this.$refs.file.files[0]) {
        this.loadingDialog = true;
        const data = await downScaleImageFromFile(
          this.$refs.file.files[0],
          200
        );

        const snapshot = await STORAGE.ref("appsell")
          .child("attachments/" + uuidv4())
          .putString(data, "data_url");
        const downloadURL = await snapshot.ref.getDownloadURL();

        const response = await this.$store.dispatch(
          "conversations/SEND_MESSAGE",
          {
            attachment: true,
            url: downloadURL,
            conversationDetails: this.selectedConversation
            //distributorId: this.selectedConversation.user.id
          }
        );

        this.loadingDialog = false;

        setTimeout(() => {
          this.scrollDown();
        }, 250);
      }
    },

    openNewMessageDialog() {
      this.$refs.NewMessageDialog.open();
    },

    scrollDown() {
      setTimeout(() => {
        const messagesWindow = document.getElementById("messages-container");
        const totalHeight = messagesWindow.scrollHeight;
        messagesWindow.scrollTo(0, totalHeight);
      }, 250);
    }
  },
  // beforeDestroy() {
  //   this.conversationsListener();
  //   if (this.messagesListener) {
  //     this.messagesListener();
  //   }
  // },
  computed: {
    items() {
      let conversations = this.$store.getters['conversations/GET_CONVERSATIONS_LIST'];
      conversations = conversations.filter(convo => convo.user.status.toLowerCase() === 'approved');
      console.log('conversations: ', conversations);

      let filteredConvo = [];
      if(this.search) {
        const keyword = this.search.toLowerCase();
        filteredConvo = conversations.filter((convo) => {
          let userFullname = `${convo.user.firstName} ${convo.user.middleInitial} ${convo.user.lastName}`;
          userFullname = userFullname.toLowerCase();
          
          if(userFullname.includes(keyword)) {
            return convo;
          }
        });
      }

      if(!filteredConvo.length && this.search) {
        return [];
      }

      return filteredConvo.length ? filteredConvo : conversations;
    },
    messages() {
      const list = this.$store.getters['conversations/GET_MESSAGES_LIST'];
      this.scrollDown();
      return list.filter((message) => {
        if(this.selectedConversation) {
          return message.conversationId === this.selectedConversation.id;
        
        } else {
          return message;
        }
      })
    },
    userPlaceholder() {
      return userPlaceholder;
    },
    userId() {
      //return this.$store.getters["auth/GET_USER"].id;
      return "admin";
    }
  },
  filters: {
    toFullName(user) {
      return `${user.firstName} ${user.middleInitial || ""} ${user.lastName}`;
    }
  },
  watch: {
    selectedConversation(val) {
      console.log(val);
      this.items.forEach(item => {
        item.selected = false;
      });

      const conversationIndex = this.items.findIndex(i => i.id === val.id);
      this.items[conversationIndex].selected = true;
    }
  },
  components: {
    NewMessageDialog
  }
};
</script>

<style scoped>
#conversation-container {
  height: 80vh;
  overflow-y: scroll;
}

#selected-conversation-header {
  height: 55px;
}

#messages-container {
  height: 62vh;
  overflow-y: scroll;
}

#text-container {
  height: 10vh;
  overflow-y: none;
}

.you {
  float: right;
}

.message-container:before,
.message-container:after {
  content: " ";
  display: table;
}
.message-container:after {
  clear: both;
}

.not-you {
  float: left;
}

.message {
  position: relative;
  max-width: 400px;
  width: auto;
  display: inline-block;
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-bottom: 10px;
}

.strong-text {
  font-weight: 900;
}
</style>
