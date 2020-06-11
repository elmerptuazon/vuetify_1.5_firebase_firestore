var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  projectId: '"sipavenue-dev"',
  appId: '"1:509789194682:web:150e0de65622e8d347f583"',
  databaseURL: '"https://sipavenue-dev.firebaseio.com"',
  storageBucket: '"sipavenue-dev.appspot.com"',
  apiKey: '"AIzaSyAg7uAQGGRQ5VrzAYrozbjEyur-QJSpBsE"',
  authDomain: '"sipavenue-dev.firebaseapp.com"',
  messagingSenderId: '"509789194682"',
  storageCode: '"SipAvenue"',
  primaryColor: '"#f7a978"',
  companyName: '"Sip Avenue"',
  accountManagementURL: '"https://us-central1-sipavenue-dev.cloudfunctions.net/accounts"'
})
