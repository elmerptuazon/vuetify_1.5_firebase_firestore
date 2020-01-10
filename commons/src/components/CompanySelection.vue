<template>
	<div>
		<v-card-title class="pa-0">
			<v-spacer></v-spacer>
			<v-menu offset-y v-show="show">
				<v-btn slot="activator" color="primary" dark depressed>
					{{selectedCompany}} <v-icon right>arrow_drop_down</v-icon>
				</v-btn>
				<v-list>
					<v-list-tile @click="selectCompany('all')">
						<v-list-tile-title>All Companies</v-list-tile-title>
					</v-list-tile>
					<v-divider></v-divider>
					<v-list-tile v-for="(item, index) in GET_COMPANIES" :key="index" @click="selectCompany(item)">
						<v-list-tile-title>{{ item.name }}</v-list-tile-title>
					</v-list-tile>
				</v-list>
			</v-menu>
		</v-card-title>
	</div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
	created () {
		if (this.GET_COMPANIES.length < 1) {
			this.$store.dispatch('companies/GET_COMPANIES');
		}

		if (this.roles.includes('webAdmin')) {
			this.show = false
		}
	},
	data: () => ({
		selectedCompany: 'All Companies',
		show: true
	}),
	methods: {
		selectCompany (company) {

			if (typeof company == 'string' && company == 'all') {
				this.selectedCompany = 'All Companies';
			} else {
				this.selectedCompany = company.name;
			}

			this.$emit('selectedCompany', company);
		}
	},
	computed: {
		...mapGetters({
			GET_COMPANIES: 'companies/GET_COMPANIES',
			roles: 'auth/GET_ROLES'
		})
	}
}
</script>
