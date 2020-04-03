<template>
    <v-container fluid>
       <v-card>
            <v-container fluid>
                <v-layout align-center justify-start wrap>
                    <v-flex xs1>
                        <div class="headline">Articles</div>
                    </v-flex>
                    <v-flex xs7>
                        <v-text-field
                            v-model="search"
                            single-line class="ml-3"
                            placeholder="search an article..."
                            append-icon="search"
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs2 offset-xs2>
                        <v-btn
                            @click="openDetails('add', null)"
                            color="primary" 
                        >POST NEW ARTICLE</v-btn>
                    </v-flex>
                </v-layout>
            </v-container>

            <v-divider class="my-2"></v-divider>

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

            <v-container v-else fluid>
                <v-layout 
                    align-start 
                    justify-start mb-5 wrap
                    v-for="article in articles" :key="article.id"
                >
                    <v-flex align-start justify-baseline align-content-baseline align-self-baseline xs12>
                        <v-divider/>
                    </v-flex>
                    <v-flex xs3>
                        <v-img
                            v-if="article.headerURL"
                            height="150px"
                            width="230px"
                            :src="article.headerURL"
                            :alt="article.title"
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
                            :alt="article.title"
                            :src="require('@/assets/no-image.png')"
                        >
                            <div 
                                slot="placeholder"
                                fill-height align-center
                                justify-center ma-0
                            >No Picture</div>
                        </v-img>
                    </v-flex>
                    <v-flex xs6 mt-2 pl-4>
                        <div class="headline font-weight-bold">{{ article.title }}</div>
                        <div class="body-1 primary--text mt-2">
                            <v-icon small color="primary">schedule</v-icon>
                            {{ formatDate(article.publishDate) }}
                        </div>
                        <div class="caption font-weight-thin mt-4"> {{ summarizeSource(article.source) | uppercase }}</div>
                    </v-flex>
                    <v-flex xs3 pl-3 align-self-center>
                        <v-tooltip left>
                            <template v-slot:activator="{on}">
                                <v-btn 
                                    fab small dark 
                                    color="red lighten-1" 
                                    v-on="on"
                                    @click="deleteArticle(article)"
                                >
                                    <v-icon>delete_forever</v-icon>
                                </v-btn>
                            </template>
                            <span>Delete this Article</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{on}">
                                <v-btn 
                                    fab small dark 
                                    color="primary" 
                                    v-on="on"
                                    @click="changeArticleStatus(article)"
                                >
                                    <v-icon v-if="article.active">visibility_off</v-icon>
                                    <v-icon v-else>visibility</v-icon>
                                </v-btn>
                            </template>
                            <span v-if="article.active">Hide this Article</span>
                            <span v-else>Show this Article</span>
                        </v-tooltip>
                        <v-tooltip right>
                            <template v-slot:activator="{on}">
                                <v-btn 
                                    fab small dark 
                                    color="success" 
                                    v-on="on"
                                    @click="openDetails('edit', article)"
                                >
                                    <v-icon>edit</v-icon>
                                </v-btn>
                            </template>
                            <span>Edit this Article</span>
                        </v-tooltip>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>

        <v-dialog 
            v-model="detailsDialog"
            width="1050px"
            persistent
        >
            <v-card>
                <v-card-title class="primary white--text font-weight-bold headline dark">
                    <div v-if="selectedArticle.mode === 'add'">POST NEW ARTICLE</div>
                    <div v-else>EDIT ARTICLE DETAILS</div>
                    <v-spacer></v-spacer>
                    <v-icon medium color="white" @click="closeDetailsDialog">close</v-icon>
                </v-card-title>

                <v-container fluid>
                    <v-layout align-center justify-start wrap>
                        <v-flex xs12 mb-3>
                            <div class="title primary--text">Article's Photo Banner</div>
                        </v-flex>
                        
                        <v-flex xs3>
                            <v-text-field
                                class="pl-2"
                                v-model="filename"
                                placeholder="click here to select an image..."
                                hint="click this field again to replace the image..."
                                prepend-inner-icon="attach_file"
                                readonly
                                @click="$refs.headerFile.click()"
                            ></v-text-field>
                            <input
                                type="file"
                                ref="headerFile"
                                value="upload"
                                style="display: none"
                                accept=".png, .jpg, .jpeg"
                                @change="validateFile"
                            />
                            <v-btn
                                class="mt-3"
                                :disabled="!selectedArticle.headerURL"
                                color="red lighten-1"
                                dark outline small
                                @click="removePhoto"
                            >
                                REMOVE PHOTO
                            </v-btn>
                        </v-flex>

                        <v-flex xs4 offset-xs2>
                            <v-img
                                v-if="selectedArticle.headerURL"
                                contain
                                width="550px"
                                height="250px"
                                :src="selectedArticle.headerURL"
                                :alt="selectedArticle.title"
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
                                        color="grey lighten-5"
                                    ></v-progress-circular>
                                </v-layout>
                            </v-img>
                            <v-img
                                v-else
                                contain 
                                width="550px"
                                height="250px"
                                :src="require('@/assets/no-image.png')"
                                :alt="selectedArticle.title"
                            ></v-img>
                        </v-flex>

                        <v-flex xs12 mt-3>
                            <v-divider></v-divider>
                        </v-flex>
                    </v-layout>                    

                    <v-layout align-center justify-start wrap mt-4>
                        <v-flex xs2>
                            <div class="title primary--text">Article Title: </div>
                        </v-flex>
                        <v-flex xs9>
                            <v-text-field
                                v-model="selectedArticle.title"
                                placeholder="enter title of the article..."
                            ></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                            <v-divider class="my-2"/>    
                        </v-flex>
                    </v-layout>

                    <v-layout 
                        v-if="selectedArticle.mode === 'edit'"
                        align-center justify-start wrap mt-4
                    >
                        <v-flex xs2>
                            <div class="title primary--text">Publish Date: </div>
                        </v-flex>
                        <v-flex xs5>
                            <div class="title">
                                {{ formatDate(selectedArticle.publishDate) }}
                            </div>
                        </v-flex>
                    </v-layout>

                    <v-layout
                        v-else 
                        align-center justify-start wrap mt-4
                    >
                        <v-flex xs12>
                            <div class="title primary--text">Publish Date: </div>
                        </v-flex>
                        <v-flex xs3 class="mt-2">
                            <v-menu
                                lazy
                                :close-on-content-click="false"
                                :disabled="publishNow"
                                v-model="dateMenu"
                                transition="scale-transition"
                                offset-y
                                full-width
                                :nudge-right="40"
                                max-width="290px"
                                min-width="290px"
                                >
                                <v-text-field
                                    slot="activator"
                                    label="Publish Date"
                                    v-model="selectedArticle.date"
                                    prepend-inner-icon="event"
                                    :disabled="publishNow"
                                    readonly
                                ></v-text-field>
                                <v-date-picker
                                    color="primary"
                                    v-model="selectedArticle.date"
                                    :disabled="publishNow"
                                    @input="dateMenu = false"
                                ></v-date-picker>
                            </v-menu>
                        </v-flex>
                         <v-flex xs3 class="ml-5">
                            <v-menu
                                lazy ref="menu"
                                :close-on-content-click="false"
                                :disabled="publishNow"
                                v-model="timeMenu"
                                transition="scale-transition"
                                offset-y
                                full-width
                                :nudge-right="40"
                                max-width="290px"
                                min-width="290px"
                                >
                                <v-text-field
                                    slot="activator"
                                    label="Publish Time"
                                    v-model="selectedArticle.time"
                                    prepend-inner-icon="schedule"
                                    :disabled="publishNow"
                                    readonly
                                ></v-text-field>
                                <v-time-picker
                                    color="primary"
                                    v-if="timeMenu"
                                    v-model="selectedArticle.time"
                                    :disabled="publishNow"
                                    full-width
                                >
                                    <v-spacer></v-spacer>
                                    <v-btn flat color="black" @click="timeMenu = false">
                                        CANCEL
                                    </v-btn>
                                    <v-btn depressed color="primary" @click="$refs.menu.save(selectedArticle.time)">
                                        OK
                                    </v-btn>
                                </v-time-picker>
                            </v-menu>
                        </v-flex>
                        <v-flex xs4 class="ml-5">                        
                            <v-checkbox
                                v-model="publishNow"
                                label="Publish Now"
                            ></v-checkbox>
                        </v-flex>
                        <v-flex xs12>
                            <v-divider class="my-2"/>
                        </v-flex>
                    </v-layout>

                    <v-layout align-center justify-start wrap mt-4>
                        <v-flex xs12>
                            <div class="title primary--text">Article Text: </div>
                        </v-flex>
                        <v-flex xs12 class="mt-2">
                            <v-textarea
                                v-model="selectedArticle.description"
                                clearable box auto-grow
                                rows="10"
                                placeholder="enter article text here..."
                            />
                        </v-flex>
                        <v-flex xs12>
                            <v-divider class="my-2"/>
                        </v-flex>
                    </v-layout>

                    <v-layout align-center justify-start wrap mt-4>
                        <v-flex xs2>
                            <div class="title primary--text">Article's Source: </div>
                        </v-flex>
                        <v-flex xs9>
                            <v-text-field
                                v-model="selectedArticle.source"
                                placeholder="enter url of the article..."
                            ></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                            <v-divider class="my-2"/>
                        </v-flex>
                    </v-layout>

                </v-container>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn 
                        @click="closeDetailsDialog"
                        flat color="black"
                        class="ml-2"
                    >CANCEL</v-btn>
                    <v-btn 
                        v-if="selectedArticle.mode === 'add'"
                        depressed 
                        color="primary" 
                        @click="submitArticle"
                        :loading="submitLoading"
                        :disabled="submitLoading"
                    >
                        POST THIS ARTICLE
                    </v-btn>
                    <v-btn 
                        v-else
                        depressed 
                        color="primary" 
                        @click="editArticle"
                        :loading="submitLoading"
                        :disabled="submitLoading"
                    >
                        APPLY CHANGES
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <Toast ref="toast" />
    </v-container>
</template>

<script>
import mixins from "@/mixins";
import { FB, DB } from "@/config/firebase";
import { mapState } from "vuex";
import Toast from "@/components/Toast";
import moment from 'moment';

export default {
    components: {
        Toast
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
        detailsDialog: false,
        previewDialog: false,

        search: null,

        dateMenu: false,
        timeMenu: false,

        selectedArticle: {
            mode: '',
            title: null,

            headerURL: null,
            newHeaderPic: null,
            
            description: null,
            date: null,
            time: null,
            source: null,    
        },

        publishNow: false,

        submitLoading: false,
        
        filename: null,

    }),

    methods: {
        openPreview(article) {
            this.selectedArticle = Object.assign({}, article);
            this.previewDialog = true;
        },

        openDetails(mode, article) {
            if(mode === 'add') {
                this.selectedArticle.mode = 'add';
                this.detailsDialog = true;
            
            } else if(mode === 'edit') {
                this.selectedArticle = Object.assign({}, article);
                this.selectedArticle.mode = 'edit';
                this.selectedArticle.date = moment(article.publishDate).format('YYYY-MM-DD');
                this.selectedArticle.time = moment(article.publishDate).format('hh:mm');
                this.detailsDialog = true;
            }  
        },

        closeDetailsDialog() {
            this.publishNow = false;

            this.detailsDialog = false;
            this.selectedArticle = {
                mode: '',
                title: null,

                headerURL: null,
                newHeaderPic: null,
                
                description: null,
                date: null,
                time: null,
                source: null, 
            };

            this.filename = null;
            this.$refs.headerFile.value = null;
            
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

        formatDate(dateTime) {
            return moment(parseInt(dateTime)).format('MMMM DD YYYY, h:mm a');
        },

        removePhoto() {
            this.selectedArticle.headerURL = null;
            this.$refs.headerFile.value = '';
            this.filename = null;
        },

        validateFile(el) {
            if (!el.target.value) {
                return;
            }
            console.log(el);

            const path = el.target.value;
            const idxDot = path.lastIndexOf(".") + 1;
            const extFile = path.substr(idxDot, path.length).toLowerCase();

            const acceptedFiles = ["jpg", "jpeg", "png"];

            if (!acceptedFiles.includes(extFile)) {
                this.$refs.headerFile.value = "";
                this.$swal.fire({
                    type: "error",
                    title: "Error",
                    text: "The uploaded file is not an image file. Please try again."
                });

            } else {
                this.selectedArticle.headerURL = URL.createObjectURL(el.target.files[0]);
                this.selectedArticle.newHeaderPic = el.target.files[0];
                this.filename = el.target.files[0].name;
            }

        },

        validateArticleFields() {
            const { mode, headerURL, newHeaderPic, title, date, time, description, source } = this.selectedArticle;
            const publishNow = this.publishNow;
            
            if(!title || (title >= '' && title <= '                           ') ) {
                this.$swal.fire({
                    type: "error",
                    title: "Error",
                    text: "Article Title field cannot be empty!"
                });
                return false;
            }

            if(mode === 'add') {
                if((!date || date >= '' && date <= '                    ') && !publishNow) {
                    this.$swal.fire({
                        type: "error",
                        title: "Error",
                        text: "Publish Date is required!"
                    });
                    return false;
                }

                if((!time || time >= '' && time <= '                    ') && !publishNow) {
                    this.$swal.fire({
                        type: "error",
                        title: "Error",
                        text: "Publish Date is required!"
                    });
                    return false;
                }
            }
            

            if((!description || description >= '' && description <= '                    ')) {
                this.$swal.fire({
                    type: "error",
                    title: "Error",
                    text: "Article Text is required!"
                });
                return false;
            }

            if((!source || source >= '' && source <= '                    ')) {
                this.$swal.fire({
                    type: "error",
                    title: "Error",
                    text: "Article Source is required!"
                });
                return false;
            }

            return true;
        },

        async submitArticle() {
            this.submitLoading = true;
            console.log('submit article');

            const validated = await this.validateArticleFields();

            if(!validated) {
                this.submitLoading = false;
                return;
            }

            const { headerURL, newHeaderPic, title, date, time, description, source } = this.selectedArticle;
            const publishNow = this.publishNow;

            let publishDate;
            if(publishNow) {
                publishDate = moment().format('x');

            } else {
                publishDate = moment(`${date} ${time}`).format('x');
            }

            console.log(this.selectedArticle);
            console.log(publishDate);

            try {
                await this.$store.dispatch('articles/ADD_ARTICLE', {
                    active: true,
                    title,
                    publishDate,
                    description,
                    source,
                    file: newHeaderPic || null
                });
                
                this.submitLoading = false;

                this.$swal.fire({
                    type: 'success',
                    title: 'Posted!',
                    text: 'The article was posted successfully!'
                }).then(() => {
                    this.closeDetailsDialog();
                });

                this.$refs.headerFile.value = "";
            
            } catch(error) {
                console.log(error);
                this.submitLoading = false;

                this.$swal.fire({
                    type: 'error',
                    title: 'Error',
                    text: 'An error occured, please try again.'
                });

                this.$refs.headerFile.value = "";
            }
        },

        async editArticle() {
            this.submitLoading = true;

            const validated = await this.validateArticleFields();

            if(!validated) {
                this.submitLoading = false;
                return;
            }

            const { id, newHeaderPic, headerURL, title, description, source } = this.selectedArticle;

            let oldArticleDetails = this.$store.getters['articles/GET_ARTICLES'];
            oldArticleDetails = oldArticleDetails.find(article => article.id === id);

            console.log(oldArticleDetails);
            
            let downloadURL;

            //if no changes, just let it be
            if(oldArticleDetails.headerURL === headerURL) {
                downloadURL = headerURL;

            //remove photo
            } else if( oldArticleDetails.headerURL && (!headerURL && !newHeaderPic) ) {
                try {
                    await this.$store.dispatch('articles/DELETE_HEADER_PIC', id);
                    downloadURL = null;
                } catch(error) {
                    console.log(error);
                    downloadURL = null;
                }
            
            //replace existing photo
            } else if(newHeaderPic && oldArticleDetails.headerURL) {
                try {
                    downloadURL = await this.$store.dispatch('articles/REPLACE_HEADER_PIC', {
                        id: id,
                        file: newHeaderPic
                    });
                
                } catch(error) {
                    console.log(error);
                }
            
            //add photo if previously none
            } else if(newHeaderPic && !oldArticleDetails.headerURL) {
                try {
                    downloadURL = await this.$store.dispatch('articles/REPLACE_HEADER_PIC', {
                        id: id,
                        file: newHeaderPic
                    });
                
                } catch(error) {
                    console.log(error);
                }
            }

            try {
                await this.$store.dispatch('articles/UPDATE_ARTICLE', {
                    id: id,
                    updatedDetails: {
                        title,
                        description,
                        source,
                        headerURL: downloadURL
                    }
                });

                this.submitLoading = false;

                this.$swal.fire({
                    type: 'success',
                    title: 'Success!',
                    text: 'The article was edited successfully!'
                });

                this.closeDetailsDialog();
                
                
            
            } catch(error) {
                console.log(error);

                this.$swal.fire({
                    type: 'error',
                    title: 'Error!',
                    text: 'An error occured, please try again.'
                });

                this.submitLoading = false;

            }

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

                if(keyword >= " " 
                    && keyword <= "                                       ") 
                {
                    return article;
                }

                if(article.title.toLowerCase().includes(keyword) || summarizedSource.includes(keyword)) {
                    return article;
                }
            }) 
        }
    },
    mixins: [mixins],
    watch: {
        publishNow(val) {
            if(val) {
                this.selectedArticle.date = null;
                this.selectedArticle.time = null;
            }
        }
    },
}
</script>

<style scoped>

</style>