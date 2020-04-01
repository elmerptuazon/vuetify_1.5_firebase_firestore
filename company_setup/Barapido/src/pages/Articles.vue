<template>
    <v-container v-if="loading" fluid>
        <v-layout align-center justify-center>
            <v-flex xs10>
                <v-progress-circular
                    color="primary"
                    indeterminate
                    width="7"
                >
                    <div class="headline primary--text font-weight-bold">Please Wait...</div>
                </v-progress-circular>
            </v-flex>
        </v-layout>
    </v-container>
    <v-container v-else fluid>
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

            <v-container fluid>

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
                    <v-layout align-center justify-center wrap>
                        <v-flex xs12>
                            <div class="title primary--text">Article's Photo Banner</div>
                        </v-flex>

                        <v-flex xs5>
                            <input
                                type="file"
                                ref="headerFile"
                                value="upload"
                                accept=".png, .jpg, .jpeg"
                                @change="validateFile"
                                label="Article's Photo Banner"
                                prepend-inner-icon="insert_photo"
                            />
                        </v-flex>
                        <v-flex xs7>
                            <v-avatar size="200px" tile>
                                <v-img
                                    v-if="selectedArticle.tempHeaderURL"
                                    contain size="200px"
                                    :src="selectedArticle.tempHeaderURL"
                                    :alt="selectedArticle.title"
                                ></v-img>
                                <v-img
                                    v-else-if="selectedArticle.headerURL"
                                    contain size="200px"
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
                                    contain size="200px"
                                    :src="require('@/assets/no-image.png')"
                                    :alt="selectedArticle.title"
                                ></v-img>
                            </v-avatar>
                        </v-flex>
                        <v-flex xs12>
                            <v-divider class="my-2"></v-divider>
                        </v-flex>
                    </v-layout>                    

                    <v-layout align-center justify-start wrap mt-3>
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

                    <v-layout align-center justify-start wrap mt-3>
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

                    <v-layout align-center justify-start wrap mt-3>
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

                    <v-layout align-center justify-start wrap mt-3>
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
                    <v-btn depressed color="primary" @click="submitArticle">
                        <span v-if="selectedArticle.mode === 'add'">POST THIS ARTICLE</span>
                        <span v-else-if="selectedArticle.mode === 'edit'">CONFIRM CHANGES</span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import mixins from "@/mixins";
import { FB, DB } from "@/config/firebase";
import { mapState } from "vuex";
import moment, { now } from 'moment';

export default {
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
            tempHeaderURL: null,
            description: null,
            date: null,
            time: null,
            source: null,    
        },

        publishNow: false,

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
                this.detailsDialog = true;
            }  
        },

        closeDetailsDialog() {
            this.detailsDialog = false;
            this.selectedArticle = {
                mode: '',
                title: null,
                headerURL: null,
                tempHeaderURL: null,
                description: null,
                date: null,
                time: null,
                source: null, 
            };

            this.publishNow = false;
        },

        timeCalculator(dateCreated) {
            return dateCreated;
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
                this.selectedArticle.tempHeaderURL = URL.createObjectURL(el.target.files[0]);
            }

        },

        validateArticleFields() {
            const { headerURL, title, date, time, description, source } = this.selectedArticle;
            const publishNow = this.publishNow;
            
            if(!title || (title >= '' && title <= '                           ') ) {
                this.$swal.fire({
                    type: "error",
                    title: "Error",
                    text: "Article Title field cannot be empty!"
                });
                return false;
            }

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
                return;
            }

            const { headerURL, title, date, time, description, source } = this.selectedArticle;
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
                    headerURL,
                    title,
                    publishDate,
                    description,
                    source
                });
                
                this.submitLoading = false;

                this.$swal.fire({
                    type: 'success',
                    title: 'Posted!',
                    text: 'The article was posted successfully!'
                }).then(() => {
                    this.closeDetailsDialog();
                });

            
            } catch(error) {
                console.log(error);
                this.submitLoading = false;

                this.$swal.fire({
                    type: 'error',
                    title: 'Error',
                    text: 'An error occured, please try again.'
                });
            }
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
    computed: {
        articles() {
            return this.$store.getters['articles/GET_ARTICLES'];
        }
    },
    components: {
    }
}
</script>

<style scoped>

</style>