<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <v-layout row wrap align-center justify-start>
          <v-flex xs3>
            <div class="headline">Branch Accounts</div>
          </v-flex>

          <v-flex xs4>
            <v-text-field
              append-icon="search"
              label="Search branch..."
              single-line
              hide-details
              v-model="search"
            ></v-text-field>
          </v-flex>

          <v-flex xs2 ml-4>
            <v-btn dark color="primary" @click="addBranchDialog = true">
              <!-- <v-icon class="mr-2">add</v-icon> -->
              REGISTER A BRANCH
            </v-btn>
          </v-flex>

          <v-flex xs2 ml-2>
            <v-btn dark color="primary" @click="excelDialog = true">
              <!-- <v-icon class="mr-2">insert_drive_file</v-icon> -->
              UPLOAD EXCEL FILE
            </v-btn>
          </v-flex>
        </v-layout>
        
      </v-card-title>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="items"
        item-key="id"
        class="elevation-1"
        :loading="tableLoading"
        :search="search"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
      >
        <template slot="items" slot-scope="props">
          <tr @click="viewUser(props.item)">
            <td class="text-xs-center pa-2">
              <v-avatar size="80px" tile v-if="props.item.downloadURL">
                <img
                  :src="props.item.downloadURL"
                  :alt="props.item.firstName"
                />
              </v-avatar>
              <img
                :src="userPlaceholder"
                alt="no_image"
                v-else
                style="width: 50%;"
              />
            </td>
            <td class="text-xs-left">{{ props.item.agentId }}</td>
            <td class="text-xs-left">{{ props.item.branchName }}</td>
            <td class="text-xs-left">
              <span v-if="!props.item.managersName">{{ props.item.firstName }} {{ props.item.middleInitial }} {{ props.item.lastName }}</span>
              <span v-else>{{ props.item.managersName }}</span>
            </td>
            <!-- <td class="text-xs-center">{{ props.item.firstName }}</td>
            <td class="text-xs-center">{{ props.item.middleInitial }}</td>
            <td class="text-xs-center">{{ props.item.lastName }}</td> -->
            <!-- <td class="text-xs-center">{{ props.item.birthday }}</td>
            <td class="text-xs-center">{{ props.item.gender }}</td> -->
            <td class="text-xs-left">{{ new Date(props.item.approvedDate) | momentize('D-MMM-YYYY') }}</td>
            <td class="text-xs-left">{{ props.item.email }}</td>
            <td class="text-xs-left">{{ props.item.contact }}</td>
            <td class="text-xs-left">{{ showFullAddress(props.item.address) }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog max-width="500px" v-model="excelDialog" persistent>
      <v-card>
        <v-card-title>
          <div class="title">
            Adding Multiple Branches through Excel File
          </div>
        </v-card-title>
        <v-card-text>
          <div class="mb-1">
            <input
              type="file"
              ref="excelFile"
              value="upload"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              @change="validateExcelFile"
            />
          </div>
          <div class="mb-1 caption">
            <v-icon small>info</v-icon>
            <span class="font-italic"
              >the file upload only accepts a specified
              <a
                class="font-weight-bold"
                :href="excelDownloadURL"
                download="Category Excel Template"
                >excel template.</a
              ></span
            >
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn flat @click.native="excelDialog = false">CANCEL</v-btn>
          <v-btn
            color="primary"
            @click.native="batchRegisterBranch"
            :loading="excelButtonLoading"
            >UPLOAD FILE
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <RegisterBranch :addBranchDialog="addBranchDialog" @closeAddBranchDialog="closeBranchDialog"/>
  </v-container>
</template>

<script>
import axios from "axios";
import XLSX from "xlsx";
import moment from 'moment';
import mixins from "@/mixins";
import { DB } from "@/config/firebase";
import userPlaceholder from "@/assets/DefaultBranchPic.png";
import RegisterBranch from "@/components/RegisterBranch.vue";
const usersCollection = DB.collection("accounts");

export default {
  async mounted() {
    this.excelDownloadURL = await this.$store.dispatch('auth/GET_TEMPLATE_EXCEL');
  },
  
  // async created() {
  //    await this.fetchUsers();
  //    this.excelDownloadURL = ''; 
  // },

  data: () => ({
    // items: [],
    search: null,
    rowsPerPageItems: [10, 20, 30, { text: "All", value: -1 }],
    selected: [],
    pagination: {
      sortBy: 'Approved Date',
    },
    tableLoading: false,
    headers: [
      {
        text: "Thumbnail",
        align: "center",
        sortable: false,
        value: "downloadURL"
      },
      {
        text: "Branch ID",
        value: "agentId"
      },
      {
        text: "Branch Name",
        value: "branchName"
      },
      {
        text: "Branch Manager",
        value: "lastName"
      },
      {
        text: "Approved Date",
        value: "approvedDate"
      },
      // {
      //   text: "First name",
      //   value: "firstName"
      // },
      // {
      //   text: "Middle initial",
      //   value: "middleInitial"
      // },
      // {
      //   text: "Last name",
      //   value: "lastName"
      // },
      // {
      //   text: "Birthday",
      //   value: "birthday"
      // },
      // {
      //   text: "Gender",
      //   value: "gender"
      // },
      {
        text: "Email",
        value: "email"
      },
      {
        text: "Contact",
        value: "contact"
      },
      {
        text: "Address",
        value: "address.house"
      }
    ],

    userPlaceholder: userPlaceholder,
    loading: false,
    addBranchDialog: false,
    excelDialog: false,
    excelButtonLoading: false,
    excelDownloadURL: '',
    
  }),

  computed: {
    items() {
      const branches = this.$store.getters['distributors/GET_RESELLERS_LIST'];
      this.tableLoading = !branches.length ? true : false;
      return branches; 
    }
  },

  methods: {
    closeBranchDialog(val) {
      this.addBranchDialog = val;
    },
    showFullAddress(address) {
      const { house, streetName, barangay, citymun, province, zipCode } = address; 
      return `${house}, ${streetName}, ${barangay}, ${province}, ${zipCode}`;
    },

    viewUser(account) {
      this.$router.push({
        name: "RegistrationDetails",
        params: { uid: account.id, account }
      });
    },

    validateExcelFile(el) {
      if (!el.target.value) {
        return;
      }

      const path = el.target.value;
      const idxDot = path.lastIndexOf(".") + 1;
      const extFile = path.substr(idxDot, path.length).toLowerCase();

      const acceptedFiles = ["xlsx", "xls", "_xls", "_xlsx"];

      if (!acceptedFiles.includes(extFile)) {
        this.$refs.excelFile.value = "";
        this.$swal.fire({
          type: "error",
          title: "Error",
          text: "The uploaded file is not an excel file. Please try again."
        });
        return;
      }
    },

    async batchRegisterBranch() {
      this.excelButtonLoading = true;
      if (!this.$refs.excelFile.files[0]) {
        this.$swal.fire({ type: "warning", title: "Choose a file first." });
        this.excelButtonLoading = false;
        return;
      }

      const answer = await this.$swal.fire({
        title: "Are you sure?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        showCloseButton: true
      });

      if (!answer.value) {
        this.excelButtonLoading = false;
        return;
      }
      
      let branchWithErrors = [];

      try {
        const file = this.$refs.excelFile.files[0];
        const objectURL = window.URL.createObjectURL(file);
        const promise = await axios.get(objectURL, {
          responseType: "arraybuffer"
        });

        //Process Returned Reponse from Axios
        const data = new Uint8Array(promise.data);
        const arr = new Array();
        for (let i = 0; i != data.length; ++i) {
          arr[i] = String.fromCharCode(data[i]);
        }

        const workbook = XLSX.read(arr.join(""), { type: "binary" });
        const workbookSheetsLength = workbook.SheetNames.length;
        
        for(let i = 0; i !== workbookSheetsLength; i++) {
          let worksheet = workbook.Sheets[workbook.SheetNames[i]];

          let branches = XLSX.utils.sheet_to_json(worksheet, { raw: false });
          console.log('extracted branches: ', branches);

          branches = branches.map(branchObj => {
            let registerData = {
              branchName: branchObj['BRANCH NAME'],
              firstName: branchObj['BRANCH MANAGER FIRST NAME'],
              middleInitial: branchObj['BRANCH MANAGER MIDDLE INITIAL'],
              lastName: branchObj['BRANCH MANAGER LAST NAME'],
              establishDate: branchObj['DATE ESTABLISHED'],
              
              email: branchObj['EMAIL'],
              contact: branchObj['CONTACT NUMBER'],
              social: {
                facebook: branchObj['FACEBOOK URL']
              },
              
              address: {
                house: branchObj['LOT / FLOOR NO.'],
                streetName: branchObj['STREET NAME'],
                barangay: branchObj['BARANGAY'],
                citymun: branchObj['CITY / MUNICIPALITY'],
                province: branchObj['PROVINCE'],
                zipCode: branchObj['ZIP CODE'],
              },

            };

            return registerData;
          });

          for(const branchData of branches) {
            try {
              await this.$store.dispatch('distributors/ADD_BRANCH', branchData);
            
            } catch(error) {
              branchWithErrors.push({ branchName: branchData.branchName, errorMessage: error.message});
              continue;
            }
          }

        }

        this.excelButtonLoading = false;
        this.excelDialog = false;
        this.$refs.excelFile.value = null;
        this.$refs.excelFile.files = null;


        if(branchWithErrors.length) {
          let message = '';
          branchWithErrors.forEach(branch => {
            message += `<p style="align: left;">BRANCH: ${branch.branchName} <br/> ERROR: ${branch.errorMessage}</p>\n`;
          });

          this.$swal.fire({ type: "warning", title: "Some branches were not uploaded", html: message});
        
        } else {
          this.$swal.fire({ type: "success", title: "All branches were uploaded!"});
        }

      } catch(error) {
        console.log(error);

        this.excelButtonLoading = false;
        this.excelDialog = false;
        this.$swal.fire({ type: "error", title: "An Error Occurred!", text: 'There was a problem while registering your branches, please try again later' });
        this.$refs.excelFile.value = null;
        this.$refs.excelFile.files = null;

        throw error;
      }
      
    }

  },
  mixins: [mixins],
  components: {
    RegisterBranch
  }
};
</script>