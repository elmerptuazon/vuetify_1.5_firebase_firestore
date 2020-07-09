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
                                        (settings.cutOffPrice || 0) | currency("P ")
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

        <v-layout row align-center justify-start mt-6>
            <v-flex xs10>
                <v-card>
                    <v-card-title class="primary white--text">
                        <v-layout row align-center justify-start>
                            <v-flex xs12 md7 lg7>
                                <v-layout row align-center justify-center>
                                    <v-flex xs12 md4 lg4 class="font-weight-bold title">
                                        Discount List
                                    </v-flex>
                                    <v-flex xs12 md8 lg8>
                                        <v-text-field
                                            v-model="discountSearch"
                                            prepend-inner-icon="search"
                                            color="white" dark
                                            clearable
                                        ></v-text-field>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                            <v-flex xs12 md3 offset-md1 lg3 offset-lg1>
                                <v-btn color="white" outline @click="openDiscountDialog('Add', null)">Add Delivery Discount</v-btn>
                            </v-flex>
                        </v-layout>
                    </v-card-title>
                    <v-container>
                        <v-layout align-center justify-center>
                            <v-flex xs12>
                                <v-data-table
                                    :headers="discountHeaders"
                                    :items="discountList"
                                    item-id="id"
                                    class="elevation-1"
                                    :loading="loading"
                                    :search="discountSearch"
                                    :rows-per-page-items="rowsPerPageItems"
                                    no-data-text="No Discounts yet..."
                                >

                                    <template slot="items" slot-scope="props">
                                        <tr>
                                            <td class="text-xs-center">
                                                <span v-if="props.item.type === 'percentage'">{{ props.item.amount }}%</span>
                                                <span v-else-if="props.item.type === 'amount'">&#8369; {{ props.item.amount }}</span>
                                            </td>
                                            <td class="text-xs-left">{{ props.item.region }}</td>
                                            <td class="text-xs-left">{{ props.item.province || '-' }}</td>
                                            <td class="text-xs-left">{{ props.item.city || '-' }}</td>
                                            <td class="text-xs-right">
                                                <v-btn small color="red" outline @click="deleteDiscount(props.item)">
                                                    DELETE
                                                </v-btn>
                                                <v-btn small color="success" outline @click="openDiscountDialog('Edit', props.item)">
                                                    EDIT
                                                </v-btn>
                                            </td>
                                        </tr>
                                    </template>

                                </v-data-table>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card>
            </v-flex>
        </v-layout>

        <v-dialog 
            v-model="discountDialog" 
            persistent
            max-width="600px"
        >
            <v-card>
                <v-card-title class="primary white--text font-weight-bold title">
                    {{ discountDialogState }} Discount Details
                    <v-spacer></v-spacer>
                    <v-btn icon dark @click="closeDiscountDialog">
                        <v-icon color="white">close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-container>
                    <v-form lazy-validation ref="form" @submit.prevent="saveDiscount">
                        <v-layout row align-center justify-start wrap>
                            <v-flex xs12 lg12>
                                <v-radio-group v-model="selectedDiscount.type" required>
                                    <template v-slot:label>
                                        <div>Type of Discount</div>
                                    </template>
                                    <v-radio label="Percentage (%)" value="percentage"></v-radio>
                                    <v-radio label="Amount (Pesos)" value="amount"></v-radio>
                                </v-radio-group>
                            </v-flex>
                            <v-flex xs12 lg4 v-if="selectedDiscount.type !== null">
                                <v-text-field
                                    v-model="selectedDiscount.amount"
                                    type="number"
                                    label="Amount of Discount"
                                    :suffix="selectedDiscount.type === 'percentage' ? '%' : ' '"
                                    :prefix="selectedDiscount.type === 'amount' ? 'PHP' : ' '"
                                    required
                                ></v-text-field>
                            </v-flex>
                        </v-layout>
                        <v-layout row align-center justify-center wrap mt-4>
                            <v-flex xs12>
                                <v-divider></v-divider>
                            </v-flex>
                            <v-flex xs12 mt-2>
                                <div class="grey--text subheading">Location</div>
                            </v-flex>
                            <v-flex xs12 mt-4>
                                <v-autocomplete
                                    v-model="selectedDiscount.region"
                                    :items="regions"
                                    label="Region"
                                    item-text="name"
                                    return-object
                                    clearable
                                    @click:clear="clearRegion"
                                    required
                                    :disabled="locationDisabled"
                                ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 v-if="selectedDiscount.region">
                                <v-btn 
                                    outline color="success" 
                                    @click="showProvince = true;"
                                    v-if="!showProvince"
                                >Add Specific Province</v-btn>
                                <v-autocomplete
                                    v-show="showProvince"
                                    v-model="selectedDiscount.province"
                                    :items="provinces"
                                    label="Province"
                                    item-text="name"
                                    return-object
                                    clearable
                                    @click:clear="clearProvince"
                                    :required="showProvince"
                                    :disabled="locationDisabled"
                                ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 v-if="selectedDiscount.province">
                                <v-btn 
                                    outline color="success" 
                                    @click="showCity = true;"
                                    v-if="!showCity"
                                >Add Specific City / Municipality</v-btn>
                                <v-autocomplete
                                    v-show="showCity"
                                    v-model="selectedDiscount.city"
                                    :items="cities"
                                    label="City / Municipality"
                                    item-text="name"
                                    return-object
                                    clearable
                                    @click:clear="clearCity"
                                    :required="showCity"
                                    :disabled="locationDisabled"
                                ></v-autocomplete>
                            </v-flex>
                        </v-layout>

                        <v-layout row align-center justify-end wrap mt-3>
                            <v-flex xs12 mt-2><v-divider></v-divider></v-flex>
                            <v-flex xs2 mt-2>
                                <v-btn outline color="black" @click="closeDiscountDialog">CANCEL</v-btn>
                            </v-flex>
                            <v-flex xs2 mt-2 ml-3>
                                <v-btn 
                                    color="primary" 
                                    type="submit" 
                                    :disabled="areFieldsBlank" 
                                    :loading="saveBtnLoading"
                                >SAVE</v-btn>
                            </v-flex>
                        </v-layout>
                    </v-form>
                </v-container>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import mixins from "@/mixins";
import axios from 'axios';
import { FB, DB } from "@/config/firebase";
import { mapState } from "vuex";
import moment from "moment";
import philippines from 'philippines';
import Regions from 'philippines/regions';
import Provinces from 'philippines/provinces';
import Cities from 'philippines/cities';

export default {
    mixins: [mixins],
    async mounted() {
        this.loading = true;
        await this.$store.dispatch('delivery_settings/GET_DELIVERY_SETTINGS');
        await this.$store.dispatch('delivery_settings/GET_DISCOUNT_LIST');
        this.loading = false;

        console.log('settings: ', this.settings);
        this.regions = Regions;
    },
    data: () => ({
        cutOffPriceField: true,
        cutOffPriceBtn: false,

        settings: {
            cutOffPrice: 0.00
        },

        loading: false,
        discountDialog: false,
        discountDialogState: 'Add',

        selectedDiscount: {
            id: null,
            type: null,
            amount: null,
            region: null,
            province: null,
            city: null,
        },

        discountHeaders: [
            { text: 'Discount Amount', value: 'amount', align: 'center', sortable: true },
            { text: 'Region', value: 'region', align: 'left', sortable: true },
            { text: 'Province', value: 'province', align: 'left', sortable: true },
            { text: 'City', value: 'city', align: 'left', sortable: true },
            { text: 'Actions', value: '', align: 'center', sortable: false }
        ],
        rowsPerPageItems: [10, 20, 30, { text: "All", value: -1 }],
        discountSearch: null,

        regions: [],
        provinces: [],
        cities: [],
        showProvince: false,
        showCity: false,

        discountForm: false,
        saveBtnLoading: false,
        locationDisabled: false

    }),

    methods: {
        async submitCutOffPrice() {
            this.cutOffPriceBtn = true;

            try {
                await this.$store.dispatch('delivery_settings/UPDATE_DELIVERY_SETTINGS', {
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

        openDiscountDialog(state, discount) {
            this.discountDialogState = state;
            this.discountDialog = true;
            
            if(state.toLowerCase() === 'edit') {
                this.selectedDiscount = Object.assign({}, discount);

                this.selectedDiscount.region = Regions.find(region => region.name === discount.region);

                if(discount.province) {
                    this.showProvince = true;
                    this.selectedDiscount.province = Provinces.find(province => province.name === discount.province);
                
                } else {
                    this.showProvince = false; 
                }

                if(discount.city) {
                    this.showCity = true;
                    this.selectedDiscount.city = Cities.find(city => city.name === discount.city);
                
                } else {
                    this.showCity = false;
                }

                console.log(this.selectedDiscount)
            }
        },

        closeDiscountDialog() {
            this.discountDialog = false;
            this.$refs.form.reset();
            this.$refs.form.resetValidation();
        },
        
        clearRegion() {
            this.selectedDiscount.region = null;
            this.selectedDiscount.province = null;
            this.selectedDiscount.city = null;
            this.showProvince = false;
            console.log(this.selectedDiscount);
        },

        clearProvince() {
            this.selectedDiscount.province = null;
            this.selectedDiscount.city = null;
            this.showCity = false;
            console.log(this.selectedDiscount);
        },

        clearCity() {
            this.selectedDiscount.city = null;
            this.showCity = false;
            console.log(this.selectedDiscount);
        },

        async saveDiscount() {
            if(!this.$refs.form.validate()) {
                this.$swal.fire({
                    type: 'error',
                    title: 'Some fields are missing!',
                    text: 'Make sure you have filled all the required fields.'
                });
                return;
            }

            console.log(this.selectedDiscount);

            let region = this.selectedDiscount.region ? this.selectedDiscount.region.name : null;
            let province = this.selectedDiscount.province ? this.selectedDiscount.province.name : null;
            let city = this.selectedDiscount.city ? this.selectedDiscount.city.name : null;

            let amount = Number(this.selectedDiscount.amount);

            if(this.discountDialogState.toLowerCase() === 'add') {
                
                try {
                    this.saveBtnLoading = true;

                    const existingDiscount = await this.$store.dispatch('delivery_settings/CHECK_IF_DISCOUNT_EXISTS', {
                        id: null, 
                        region, 
                        province, 
                        city
                    });

                    if(existingDiscount) {
                        this.$swal.fire({
                            type: 'error',
                            title: 'Existing Discount!',
                            text: `There is an existing discount similar to what you are about to add.\nThis will not be saved.`
                        });
                        this.saveBtnLoading = false;
                        return;
                    }

                    await this.$store.dispatch('delivery_settings/ADD_DISCOUNT', {
                        type: this.selectedDiscount.type, 
                        amount, 
                        region, 
                        province, 
                        city
                    });

                    this.saveBtnLoading = false;
                    this.$swal.fire({
                        type: 'success',
                        title: 'Discount Added!'
                    });

                    this.closeDiscountDialog();

                } catch(error) {
                    console.log(error);
                    this.saveBtnLoading = false;
                    this.$swal.fire({
                        type: 'error',
                        title: 'Discount was not added!',
                        text: 'Please try again.'
                    });
                    await this.closeDiscountDialog();
                }


            } else if(this.discountDialogState.toLowerCase() === 'edit') {
                
                try {
                    this.saveBtnLoading = true;
                    
                    const existingDiscount = await this.$store.dispatch('delivery_settings/CHECK_IF_DISCOUNT_EXISTS', {
                        id: this.selectedDiscount.id, 
                        region, 
                        province, 
                        city
                    });

                    if(existingDiscount) {
                        this.$swal.fire({
                            type: 'error',
                            title: 'Existing Discount!',
                            text: `A discount with similar location already exists.\nThis will not be saved.`
                        });
                        this.saveBtnLoading = false;
                        return;
                    }

                    await this.$store.dispatch('delivery_settings/UPADTE_DISCOUNT', {
                        id: this.selectedDiscount.id, 
                        type: this.selectedDiscount.type, 
                        amount, 
                        region, 
                        province,
                        city
                    });

                    this.saveBtnLoading = false;
                    this.$swal.fire({
                        type: 'success',
                        title: 'Discount Edited!'
                    });
                    await this.closeDiscountDialog();

                } catch(error) {
                    console.log(error);
                    this.saveBtnLoading = false;
                    await this.closeDiscountDialog();
                    this.$swal.fire({
                        type: 'error',
                        title: 'Discount was not updated!',
                        text: 'Please try again.'
                    });
                }
            }
        },

        async deleteDiscount(selectedDiscount) {
            const discountAmount = selectedDiscount.type === 'percentage' ? `${selectedDiscount.amount}%` : `P${selectedDiscount.amount}`;
            const region = selectedDiscount.region ? selectedDiscount.region : '-';
            const province = selectedDiscount.province ? selectedDiscount.province : '-';
            const city = selectedDiscount.city ? selectedDiscount.city : '-';

            const response = await this.$swal.fire({
                type: 'warning',
                title: 'Confirm Discount Deletion',
                html: `
                    <b>Are you sure you want to delete the following discount entry?</b>
                    <div style="margin-top: 20px; text-align: left; padding-left: 20px;">
                        Discount Amount: <strong>${discountAmount}</strong> 
                        <br/>
                        Region: <strong>${region}</strong> 
                        <br/>
                        Province: <strong>${province}</strong> 
                        <br/>
                        City / Municipality: <strong>${city}</strong> 
                        <br/>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: 'Yes, delete it!'
            });

            if(!response.value) {
                return;
            }

            try {
                await this.$store.dispatch('delivery_settings/DELETE_DISCOUNT', selectedDiscount.id);
                this.$swal.fire({
                    type: 'success',
                    title: 'Discount Deletion Success!',
                    text: 'The discount entry has been deleted!'
                });
            
            } catch(error) {
                console.log(error);
                this.$swal.fire({
                    type: 'error',
                    title: 'Discount Deletion Failed!',
                    text: 'The discount entry was not deleted!'
                });

            }
        },

    },

    watch: {
        "selectedDiscount.region"(selectedRegion) {
            if(!selectedRegion) 
                this.provinces = [];
            else 
                this.provinces = Provinces.filter(province => province.region === selectedRegion.key);

            if(selectedRegion.name === 'NCR') {
                this.showProvince = true;
                this.selectedDiscount.province = Provinces.find(province => province.region === 'NCR');
            }
        },

        'selectedDiscount.province'(selectedProvince) {
            if(!selectedProvince) 
                return this.cities = [];
            else 
                this.cities = Cities.filter(city => city.province === selectedProvince.key)
        }
    },
    computed: {
        ...mapState('delivery_settings', {
            discountList: state => state.discountList
        }),

        setting() {
            return this.$store.getters['delivery_settings/GET_DELIVERY_SETTINGS'];
        },
        areFieldsBlank() {
            if(!this.selectedDiscount.type) return true;
            else if(!this.selectedDiscount.amount) return true;
            else if(!this.selectedDiscount.region) return true;
            else return false;
        }
    },
}
</script>

<style scoped>

</style>