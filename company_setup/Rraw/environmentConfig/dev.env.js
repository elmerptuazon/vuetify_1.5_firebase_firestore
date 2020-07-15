var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyC70H3CWjp0k6aacytzqYLmCcrqaKZncCI"',
  authDomain: '"rrawdev.firebaseapp.com"',
  databaseURL: '"https://rrawdev.firebaseio.com"',
  projectId: '"rrawdev"',
  storageBucket: '"rrawdev.appspot.com"',
  messagingSenderId: '"26080521344"',
  appId: '"1:26080521344:web:ed686a294b090493368a65"',
<<<<<<< HEAD
  primaryColor: '"#CCAFAF"',
=======
  primaryColor: '"#ccafaf"',
>>>>>>> 51ddd371688f5cc77419da081b4e09fbdb8f5410
  companyName: '"Rraw"',
  accountManagementURL: '"https://us-central1-rrawdev.cloudfunctions.net/accounts"'
})