<template>
	<v-container fluid fill-height>
		<v-layout align-center justify-center>
			<v-flex xs12 sm8 md4>
				<v-card class="elevation-12">
					<v-toolbar dark color="primary">
						<v-toolbar-title>Update catalogue</v-toolbar-title>
					</v-toolbar>
					<v-card-text>
						<v-text-field
						label="Name"
						v-model="catalogue.name"
						></v-text-field>
						<input type="file" ref="file" value="upload">
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="primary"
						class="white--text"
						:loading="loading"
						:disabled="loading"
						@click="add">Save</v-btn>
					</v-card-actions>
				</v-card>
			</v-flex>
		</v-layout>
		<sweet-modal :icon="modal.icon" ref="modal" blocking @close="viewCatalogues">
			{{modal.text}}
		</sweet-modal>
	</v-container>
</template>

<script>
import {DB, STORAGE} from '@/config/firebase';
const cataloguesCollection = DB.collection('catalogues');
const storageRef = STORAGE.ref('appsell');
export default {
	data: () => ({
		catalogue: {
			name: null
		},
		loading: false,
		modal: {
			icon: null,
			text: null
		}
	}),
	created () {
		if (!this.$route.params.data) {
			this.$router.push({name: 'Catalogues'});
			return;
		}
		this.catalogue.name = this.$route.params.data.name
	},
	methods: {
		add () {
			if (!this.catalogue.name || this.$refs.file.files.length < 1) {
				return false;
			}

			this.loading = true;

			const updateCatalogue = () => {
				const file = this.$refs.file.files[0];
				const name = this.catalogue.name;
				const metadata = { contentType: file.type };
				const task = storageRef.child('catalogues/' + name).put(file, metadata);

				task.then((snapshot) => {

					const newData = {
						name: this.catalogue.name,
						downloadURL: snapshot.downloadURL
					}
					const catalogue = cataloguesCollection.doc(this.$route.params.data.id).update(newData);

					catalogue.then(() => {
						this.loading = false;
						this.notify('success', 'Catalogue has been successfully updated');
					});

					catalogue.catch((e) => {
						console.error(e);
						this.notify('error', 'An error occurred');
					});

				});

			}

			const oldImageRef = storageRef.child('catalogues/' + this.$route.params.data.name);
			const deletePromise = oldImageRef.delete();
			deletePromise
			.then(() => {
				updateCatalogue();
			})
			.catch(() => {
				console.log('Old image missing.');
				updateCatalogue();
			});
		},
		notify (icon, text) {
			this.modal.icon = icon;
			this.modal.text = text;
			this.$refs.modal.open();
		},
		viewCatalogues () {
			this.$router.push({name: 'Catalogues'});
		}
	}
}
</script>
