<template>
	<v-snackbar top right v-model="snackbar" :color="color">
		{{ message }}
		<v-btn color="white" flat @click="snackbar = false">Close</v-btn>
	</v-snackbar>
</template>

<script>
export default {
	data: () => ({
		snackbar: false,
		message: null,
		color: null
	}),
	methods: {
		show (type, message) {
			const color = type === 'success' ? 'green' : 'red';
			this.color = color;
			this.message = message;
			this.snackbar = true;
		}
	}
}
</script>
