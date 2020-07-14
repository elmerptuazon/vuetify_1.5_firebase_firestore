<template>
    <v-container fluid>
        <v-layout align-center justify-start row>
            <v-flex xs10>
                <v-card>
                    <v-card-title class="font-weight-bold title primary white--text">
                        Free Delivery Threshold Price
                    </v-card-title>
                    <v-divider/>
                    <v-card-text>
                        <v-layout align-center justify-start wrap>
                            <v-flex xs3>
                                <div class="headline primary--text">
                                    {{ 
                                        (settings.cutOffPrice || 0) | currency("PHP ") 
                                    }} 
                                </div>
                                <v-divider vertical inlet></v-divider>
                            </v-flex>
                            
                            <v-flex xs9>
                                <v-layout align-center justify-start>
                                    <v-flex xs5 px-2>
                                        <v-text-field
                                            v-model="settings.cutOffPrice"
                                            label="Free Delivery Cut-Off Price"
                                            hint="Note: Enter minimum required amount of a Stock Order to mark it as 'Free Delivery'"
                                            :rules="numberRules"
                                            :disabled="cutOffPriceField"
                                            prefix="PHP"
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs7>
                                        <v-btn
                                            outline
                                            :class="[cutOffPriceField ? 'success--text ml-3' : 'red--text lighten-1 ml-3']"
                                            @click="cutOffPriceField = !cutOffPriceField"
                                        >
                                            <span v-if="cutOffPriceField">EDIT</span>
                                            <span v-else>CANCEL</span>
                                        </v-btn>
                                        <v-btn
                                            depressed
                                            color="primary"
                                            class="ml-6"
                                            v-if="!cutOffPriceField"
                                            @click="submitCutOffPrice"
                                            :disabled="
                                                cutOffPriceBtn || 
                                                !settings.cutOffPrice || 
                                                isNaN(settings.cutOffPrice)
                                            "
                                            :loading="cutOffPriceBtn"
                                        >APPLY</v-btn>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                    <v-divider/>
                    <v-card-actions>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import mixins from "@/mixins";
import { FB, DB } from "@/config/firebase";
import { mapState } from "vuex";
import moment from "moment";

export default {
    async mounted() {
        await this.$store.dispatch('delivery_settings/GetDeliverySettings');
        this.settings = this.$store.getters['delivery_settings/GET_DELIVERY_SETTINGS'];
        console.log('settings: ', this.settings);
    },
    data: () => ({
        // cutOffPrice: 50000,
        cutOffPriceField: true,
        cutOffPriceBtn: false,

        settings: {
            cutOffPrice: 0.00
        },
    }),

    methods: {
        async submitCutOffPrice() {
            this.cutOffPriceBtn = true;
            
            try {
                await this.$store.dispatch('delivery_settings/UpdateDeliverySettings', {
                    updatedDetails: {
                        cutOffPrice: this.settings.cutOffPrice
                    }
                });
                
                this.cutOffPriceBtn = false;
                this.$swal.fire({
                    type: 'success',
                    title: 'Success',
                    text: 'Free Delivery cut-off price has been updated'
                });

                this.cutOffPriceField = true;
            }
            catch(error) {
                console.log(error);
                this.$swal.fire({
                    type: 'error',
                    title: 'Error',
                    text: 'Free Delivery cut-off price was not updated ' + error 
                });
                this.cutOffPriceBtn = false;
            }
        },
    },
    mixins: [mixins],
    computed: {
        
    },
}
</script>

<style scoped>

</style>