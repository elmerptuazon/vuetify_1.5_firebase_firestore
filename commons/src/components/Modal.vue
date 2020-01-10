<template>
  <v-dialog v-model="dialog" max-width="400" persistent>
    <v-card>
      <v-card-title primary-title>
        <div class="title">{{ title }}</div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        {{ message }}
      </v-card-text>
      <v-card-actions>
        <v-btn block color="primary" @click="close">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
	data: () => ({
		dialog: false,
		title: null,
		message: null,
		proceedAction: null
	}),
	mounted () {
		console.log('Modal connected.');
	},
	methods: {
		show (title, message, cb = null) {
			this.title = title;
			this.message = message;
			this.dialog = true;

			if (cb) {
				this.proceedAction = cb;
			}
		},
		close () {
			this.dialog = false;

			if (this.proceedAction) {
				this.proceedAction();
			}
		}
	}
}
</script>
