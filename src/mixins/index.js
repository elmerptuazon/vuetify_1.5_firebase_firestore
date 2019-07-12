import moment from 'moment';

export default {
	data: () => ({
		basicRules: [
			v => !!v || 'This field is required'
		],
		mobileRules: [
			v => !!v || 'Mobile number is required',
			v => (v && v.length === 11) || 'Mobile must be 11 digits'
		],
		emailRules: [
			v => !!v || 'E-mail is required',
			v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
		],
		numberRules: [
			v => !!v || 'This field is required',
			v => /^\d+$/.test(v) || 'Not a valid number.'
		],
		passwordRules: [
			v => !!v || 'This field is required',
			v => (v && v.length >= 6) || 'Minimum of 6 characters',
		],
		rules: {
			required: value => !!value || 'Required.',
			passwordMin: v => v.length >= 6 || 'Minimum of 6 characters',
		}
	}),
	methods: {
		imageToDataURL(url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.onload = function () {
				var reader = new FileReader();
				reader.onloadend = function () {
					callback(reader.result);
				}
				reader.readAsDataURL(xhr.response);
			};
			xhr.open('GET', url);
			xhr.responseType = 'blob';
			xhr.send();
		}
	},
	filters: {
		momentize(val, format) {
			return moment(val).format(format);
		},
		truncate(val, len) {
			return val.substring(0, len) + '...';
		}
	}
}