<template>
    <v-container fluid>
       <v-card>
            <v-container fluid>
                <v-layout align-center justify-start wrap>
                    <v-flex xs1>
                        <div class="headline">Articles</div>
                    </v-flex>
                    <v-flex xs5>
                        <v-text-field
                            v-model="search"
                            single-line class="ml-3"
                            placeholder="search an article..."
                            append-icon="search"
                            clearable
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs2 offset-xs1>
                        <v-btn
                            @click="openDetails('add', { creationMethod: 'manual'})"
                            color="primary" 
                        >POST NEW ARTICLE</v-btn>
                    </v-flex>
                    <v-flex xs2 ml-2>
                        <v-btn
                            @click="openUrlDialog('add', null)"
                            color="primary"
                        >
                            POST NEW ARTICLE VIA URL
                        </v-btn>
                    </v-flex>
                </v-layout>
            </v-container>

            <v-divider class="my-1"></v-divider>

            <v-container v-if="loading" fluid>
                <v-layout align-center justify-center>
                    <v-progress-circular
                    color="primary"
                        indeterminate
                        width="5"
                        size="150"
                    >
                        <div class="headline primary--text">Please Wait...</div>
                    </v-progress-circular>    
                </v-layout>
            </v-container>

            <v-container v-else-if="search && !articles.length" fluid>
                <v-layout align-center justify-center>
                    <div class="text-xs-center font-weight-bold body-2 error--text">
                        Sorry, there's no related article with your search...
                    </div>
                </v-layout>
            </v-container>

            <v-data-iterator
                v-else
                :items="articles" :search="search"
                row wrap class="mt-3 px-4"
                disable-initial-sort
                no-data-text="Sorry, no articles posted yet..."
                no-result-text="Sorry, no article/s related to your search..."
                :rows-per-page-items="[-1]" hide-actions
            >
                <template v-slot:no-results>
                    <div class="red--text font-weight-bold body-1 mt-3">
                        Sorry, no articles are related to your search...
                    </div>
                </template>

                <template v-slot:no-data>
                    <div class="red--text font-weight-bold body-1 mt-3">
                        Sorry, no articles are posted yet...
                    </div>
                </template>

                <template v-slot:item="props">
                    <v-layout align-start justify-end mt-5 px-2 pb-2 wrap row>
                        <v-flex align-start justify-baseline align-content-baseline align-self-baseline xs12>
                            <v-divider/>
                        </v-flex>
                        <v-flex xs3>
                            <v-img
                                v-if="props.item.headerURL"
                                height="150px"
                                width="230px"
                                :src="props.item.headerURL"
                                :alt="props.item.title"
                                :lazy-src="require('@/assets/no-image.png')"
                            >
                                <v-layout
                                    slot="placeholder"
                                    fill-height
                                    align-center
                                    justify-center
                                    ma-0
                                >
                                    <v-progress-circular
                                        indeterminate
                                        color="primary lighten-5"
                                    ></v-progress-circular>
                                </v-layout>
                            </v-img>
                            <v-img
                                v-else
                                height="150px"
                                width="230px"
                                :alt="props.item.title"
                                :src="require('@/assets/no-image.png')"
                            >
                                <div class="align-center justify-center mt-2 text-xs-center primary--text">
                                    No Picture
                                </div>
                            </v-img>
                        </v-flex>
                        <v-flex xs6 mt-2 pl-4>
                            <div class="headline font-weight-bold">{{ props.item.title }}</div>
                            <div class="body-1 primary--text mt-2">
                                <v-icon small color="primary">schedule</v-icon>
                                {{ calculateTime(props.item.publishDate) }}
                                <span class="grey--text ml-2">
                                    | <v-icon small color="grey" class="ml-2">visibility</v-icon> 
                                    : {{ props.item.viewedBy.length }}
                                </span>
                            </div>
                            <div class="caption font-weight-thin mt-4"> {{ summarizeSource(props.item.source) | uppercase }}</div>
                        </v-flex>
                        <v-flex xs3 pl-3 align-self-center>
                            <v-tooltip left>
                                <template v-slot:activator="{on}">
                                    <v-btn 
                                        fab small dark 
                                        color="red lighten-1" 
                                        v-on="on"
                                        @click="deleteArticle(props.item)"
                                    >
                                        <v-icon>delete_forever</v-icon>
                                    </v-btn>
                                </template>
                                <span>Delete this Article</span>
                            </v-tooltip>
                            <v-tooltip top>
                                <template v-slot:activator="{on}">
                                    <v-btn 
                                        fab small dark 
                                        color="primary" 
                                        v-on="on"
                                        @click="changeArticleStatus(props.item)"
                                    >
                                        <v-icon v-if="props.item.active">visibility_off</v-icon>
                                        <v-icon v-else>visibility</v-icon>
                                    </v-btn>
                                </template>
                                <span v-if="props.item.active">Hide this Article</span>
                                <span v-else>Show this Article</span>
                            </v-tooltip>
                            <v-tooltip right>
                                <template v-slot:activator="{on}">
                                    <v-btn 
                                        fab small dark 
                                        color="success" 
                                        v-on="on"
                                        @click="openDetails('edit', props.item)"
                                    >
                                        <v-icon>edit</v-icon>
                                    </v-btn>
                                </template>
                                <span>Edit this Article</span>
                            </v-tooltip>
                        </v-flex>
                    </v-layout>
                </template>
            </v-data-iterator>
        </v-card>

        <AddManualArticle ref="manualDialog" :details="selectedArticle"/>
        <AddURLArticle ref="urlDialog" :details="selectedArticle"/>

        <Toast ref="toast" />
    </v-container>
</template>

<script>
import mixins from "@/mixins";
import { FB, DB } from "@/config/firebase";
import { mapState } from "vuex";
import Toast from "@/components/Toast";
import AddManualArticle from '@/components/AddManualArticle.vue';
import AddURLArticle from '@/components/AddUrlArticle.vue';
import moment from 'moment';

export default {
    components: {
        Toast, AddManualArticle, AddURLArticle,
    },
    async created() {
        this.loading = true;

        try {
            await this.$store.dispatch('articles/GET_ARTICLES');
            this.loading = false;

        } catch(error) {
            console.log('ARTICLES RETRIEVAL ERROR: ', error.response);
            this.loading = false;
        }
    },
    data: () => ({
        loading: false,
        previewDialog: false,
        search: null,
        selectedArticle: {},
    }),

    methods: {
        openPreview(article) {
            this.selectedArticle = Object.assign({}, article);
            this.previewDialog = true;
        },

        openDetails(mode, article) {
            if(article.creationMethod === 'url') {
                this.openUrlDialog(mode, article);
                return;
            }

            if(mode === 'add') {
                const newArticle = {
                    mode: 'add',
                    title: null,

                    headerURL: null,
                    newHeaderPic: null,
                    creationMethod: 'manual',
                    
                    description: null,
                    date: null,
                    time: null,
                    source: null,    
                };
                
                this.selectedArticle = Object.assign({}, newArticle);
                this.$refs.manualDialog.openDialog();
            
            } else if(mode === 'edit') {
                article.mode = 'edit';

                this.selectedArticle = Object.assign({}, article);
                this.$refs.manualDialog.openDialog();
            }  
        },

        openUrlDialog(mode, article) {
            if(mode === 'add') {
                const newArticle = {
                    mode: 'add',
                    title: null,

                    headerURL: null,
                    newHeaderPic: null,
                    
                    date: null,
                    time: null,
                    source: null,    
                };

                this.selectedArticle = Object.assign({}, newArticle);
                this.$refs.urlDialog.openDialog();
            
            } else if(mode === 'edit') {
                article.mode = 'edit'

                this.selectedArticle = Object.assign({}, article);
                this.$refs.urlDialog.openDialog();
            }
        },

        summarizeSource(url) {
            url += '/'

            if(url.startsWith('http://') || url.startsWith('https://')) {
                let remover = url.startsWith('http://') ? 'http://' : 'https://';
                url = url.replace(remover, "");
            }


            if(url.startsWith('www.')) {
                url = url.replace('www.', '');
            }

            const firstSlash = url.indexOf("/");

            return url.slice(0, firstSlash);
        },

        calculateTime(dateTime) {
            let verbalizedDateTime = moment(parseInt(dateTime)).calendar();

            if(verbalizedDateTime.includes('Today')) {
                return moment(parseInt(dateTime)).fromNow();
            }

            if(verbalizedDateTime.includes('Last') || verbalizedDateTime.includes('Yesterday')) {
                return verbalizedDateTime;
            }

            return moment(parseInt(dateTime)).format('MMM D, YYYY @ h:mm a').replace('@', "at");
        },

        async changeArticleStatus(article) {
            let action = article.active ? "Hide" : "Show";

            const confirm = await this.$swal.fire({
                type: 'warning',
                title: `${action} this article`,
                html: `
                    <p>Are you sure you want to ${action} the article: <em>"${article.title}"</em>?</p>
                `,
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                showCloseButton: true
            });

            if(!confirm.value) {
                return;
            }

            try {
                await this.$store.dispatch('articles/UPDATE_ARTICLE_BY_FIELD', {
                    id: article.id,
                    key: 'active',
                    value: !(article.active)
                });

                if(action === 'Hide')
                    action = 'hidden';
                else if(action === 'Show')
                    action = 'shown';

                this.$refs.toast.show(
                    "success",
                    "The article was " + action + " successfully!"
                );
            
            } catch(error) {
                if(action === 'Hide')
                    action = 'Hiding';
                else if(action === 'Show')
                    action = "Showing";

                console.log(error);
                this.$swal.fire({
                    type: 'error',
                    title: action + ' unsuccessful',
                    text: action + ' the article was not successful.'
                });
            }

        },

        async deleteArticle(article) {
            const confirm = await this.$swal.fire({
                type: 'warning',
                title: "You're about to delete an article...",
                html: `
                    <p>Are you sure you want to delete <em>"${article.title}"</em>?</p>
                `,
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                showCloseButton: true
            });
            console.log(confirm);

            if(!confirm.value) {
                return;
            }

            try {
                await this.$store.dispatch('articles/DELETE_ARTICLE', article);

                this.$refs.toast.show(
                    "success",
                    "Article has been successfully deleted!"
                );
            
            } catch(error) {
                console.log(error);
                this.$swal.fire({
                    type: 'error',
                    title: 'Deletion unsuccessful',
                    text: 'Deletion of the article was not successful.'
                });
            }
            
        }

    },
    computed: {
        articles() {
            const articles = this.$store.getters['articles/GET_ARTICLES'];
            let keyword = this.search;

            if(!keyword) {
                return articles;
            }
            
            keyword = keyword.toLowerCase();

            return articles.filter((article) => {
                const summarizedSource = this.summarizeSource(article.source).toLowerCase();

                //keyword with spaces are not recognized as a keyword
                if(keyword >= " " && keyword <= "                                       ") {
                    return article;
                }

                if(article.title.toLowerCase().includes(keyword) || summarizedSource.includes(keyword)) {
                    return article;
                }
            }) 
        }
    },
    mixins: [mixins],
}
</script>

<style scoped>

</style>