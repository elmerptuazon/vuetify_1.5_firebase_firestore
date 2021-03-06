<template>
    <!--Dialog for adding article through manual entry--->
    <v-dialog 
        v-model="detailsDialog"
        width="1050px"
        persistent
    >
        <v-card>
            <v-card-title class="primary white--text font-weight-bold headline dark">
                <div v-if="article.mode === 'add'">POST NEW ARTICLE</div>
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
                            class="pl-2" v-model="filename"
                            placeholder="click here to select an image..."
                            hint="click this field again to replace the image..."
                            prepend-inner-icon="attach_file" readonly
                            @click="$refs.headerFile.click()"
                        ></v-text-field>
                        <input
                            type="file" ref="headerFile"
                            value="upload" style="display: none"
                            accept=".png, .jpg, .jpeg"
                            @change="validateFile"
                        />
                        <v-btn
                            class="mt-3"
                            :disabled="!article.headerURL"
                            color="red lighten-1" dark outline small
                            @click="removePhoto"
                        >
                            REMOVE PHOTO
                        </v-btn>
                    </v-flex>

                    <v-flex xs4 offset-xs2>
                        <v-img
                            v-if="article.headerURL"
                            contain width="550px" height="250px"
                            :src="article.headerURL"
                            :alt="article.title"
                            :lazy-src="require('@/assets/no-image.png')"
                        >
                            <v-layout
                                slot="placeholder"
                                fill-height align-center justify-center ma-0
                            >
                                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                            </v-layout>
                        </v-img>
                        <v-img
                            v-else
                            contain width="550px" height="250px"
                            :src="require('@/assets/no-image.png')"
                            :alt="article.title"
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
                            v-model="article.title"
                            placeholder="enter title of the article..."
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                        <v-divider class="my-2"/>    
                    </v-flex>
                </v-layout>

                <v-layout 
                    v-if="article.mode === 'edit'"
                    align-center justify-start wrap mt-4
                >
                    <v-flex xs2>
                        <div class="title primary--text">Publish Date: </div>
                    </v-flex>
                    <v-flex xs5>
                        <div class="title">
                            {{ formatDate(article.publishDate) }}
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
                                v-model="article.date"
                                prepend-inner-icon="event"
                                :disabled="publishNow"
                                readonly
                            ></v-text-field>
                            <v-date-picker
                                color="primary"
                                v-model="article.date"
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
                                v-model="article.time"
                                prepend-inner-icon="schedule"
                                :disabled="publishNow"
                                readonly
                            ></v-text-field>
                            <v-time-picker
                                color="primary"
                                v-if="timeMenu"
                                v-model="article.time"
                                :disabled="publishNow"
                                full-width
                            >
                                <v-spacer></v-spacer>
                                <v-btn flat color="black" @click="timeMenu = false">
                                    CANCEL
                                </v-btn>
                                <v-btn depressed color="primary" @click="$refs.menu.save(article.time)">
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
                            v-model="article.description"
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
                            v-model="article.source"
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
                    v-if="article.mode === 'add'"
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
</template>

<script>
import moment from 'moment';
import mixins from "@/mixins";

export default {
    props: ['details'],
    mixins: [mixins],
    data: () => ({
        detailsDialog: false,
        submitLoading: false,

        dateMenu: false,
        timeMenu: false,

        article: {
            mode: '',
            title: null,

            headerURL: null,
            newHeaderPic: null,
            creationMethod: 'manual',
            
            description: null,
            date: null,
            time: null,
            source: null,    
        },

        publishNow: false,
        filename: null,
        
    }),

    watch: {
        details(obj) {
            this.article = obj;
        },

        publishNow(val) {
            if(val) {
                this.article.date = null;
                this.article.time = null;
            }
        }
    },

    methods: {
        openDialog() {
            this.detailsDialog = true;
        },

        closeDetailsDialog() {
            this.publishNow = false;

            this.detailsDialog = false;
            this.article = {
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

        formatDate(dateTime) {
            return moment(parseInt(dateTime)).format('MMMM DD YYYY, h:mm a');
        },

        removePhoto() {
            this.article.headerURL = null;
            this.article.newHeaderPic = null;
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
                this.removePhoto();

            } else {
                this.article.headerURL = URL.createObjectURL(el.target.files[0]);
                this.article.newHeaderPic = el.target.files[0];
                this.filename = el.target.files[0].name;
            }

        },

        validateArticleFields() {
            const { mode, headerURL, newHeaderPic, title, date, time, description, source } = this.article;
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

            const { headerURL, newHeaderPic, title, date, time, description, source } = this.article;
            const publishNow = this.publishNow;

            let publishDate;
            if(publishNow) {
                publishDate = moment().format('x');

            } else {
                publishDate = moment(`${date} ${time}`).format('x');
            }

            console.log(this.article);
            console.log(publishDate);

            try {
                await this.$store.dispatch('articles/ADD_ARTICLE', {
                    active: true,
                    title,
                    publishDate,
                    description,
                    source,
                    viewedBy: [],
                    creationMethod: 'manual',
                    file: newHeaderPic || null
                });
                
                this.submitLoading = false;
                this.closeDetailsDialog();

                this.$swal.fire({
                    type: 'success',
                    title: 'Posted!',
                    text: 'The article was posted successfully!'
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

            const { id, newHeaderPic, headerURL, title, description, source } = this.article;

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
                this.closeDetailsDialog();

                this.$swal.fire({
                    type: 'success',
                    title: 'Success!',
                    text: 'The article was edited successfully!'
                });
            
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
    },
}
</script>

<style>

</style>