<template>
	<div>
		<v-card class="elevation-12">
			<v-toolbar dark color="primary">
				<v-toolbar-title>Sign In</v-toolbar-title>
				<v-spacer></v-spacer>
				<Logo />
			</v-toolbar>
			<v-card-text>
				<v-form>
					<v-text-field @keyup.enter="login" v-model="email" prepend-icon="mail" name="email" label="Email" type="text"></v-text-field>
					<v-text-field @keyup.enter="login" v-model="password" prepend-icon="lock" name="password" label="Password" id="password" type="password"></v-text-field>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn class="primary white--text" :disabled="loginButtonDisabled" :loading="loginButtonDisabled" @click="login">Login</v-btn>
			</v-card-actions>
		</v-card>
		<Toast ref="toast" />
	</div>
</template>

<script>
import Toast from '@/components/Toast';
import { mapGetters } from 'vuex';
import Logo from '@/components/Logo';

export default {
	components: {
		Toast,
		Logo
	},
	data: () => ({
		email: null,
		password: null,
		loginButtonDisabled: false
	}),
	methods: {
		async login () {

			this.loginButtonDisabled = true;
			try {
				const user = await this.$store.dispatch('auth/AUTHENTICATE', {
					email: this.email,
					password: this.password
				});

				this.$router.push({ name: 'Categories' });

			} catch (error) {
				console.log(error);
				if (error.code === 'auth/argument-error') {
					this.$refs.toast.show('error', 'All fields are required');
				} else if (error.code === 'auth/user-not-found') {
					this.$refs.toast.show('error', 'User not found');
				} else {
					this.$refs.toast.show('error', error.message);
				}
			}
			this.loginButtonDisabled = false;
		}
	},
	computed: {
		...mapGetters({
			'roles': 'auth/GET_ROLES'
		})
	}
}
</script>
