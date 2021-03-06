var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  projectId: '"bentesilog-dev"',
  appId: '"1:251783709823:web:8dc3f5294f068848a22b4a"',
  databaseURL: '"https://bentesilog-dev.firebaseio.com"',
  storageBucket: '"bentesilog-dev.appspot.com"',
  apiKey: '"AIzaSyB0vI24ezWGUelBfNnby3Om9Jx_L36-l-w"',
  authDomain: '"bentesilog-dev.firebaseapp.com"',
  messagingSenderId: '"251783709823"',
  storageCode: '"BenteSilog"',
  primaryColor: '"#ff9602"',
  companyName: '"Bente Silog"',
  accountManagementURL: '"https://us-central1-bentesilog-dev.cloudfunctions.net/accounts"'
})