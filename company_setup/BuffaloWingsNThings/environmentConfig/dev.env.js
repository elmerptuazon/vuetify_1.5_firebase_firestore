var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  projectId: '"buffalowings-dev"',
  appId: '"1:536526629541:web:333e1792ce8f83d530fb4c"',
  databaseURL: '"https://buffalowings-dev.firebaseio.com"',
  storageBucket: '"buffalowings-dev.appspot.com"',
  apiKey: '"AIzaSyAeoTQG_rtVx1sSPLBd5FDvNcO1q3gSKpo"',
  authDomain: '"buffalowings-dev.firebaseapp.com"',
  messagingSenderId: '"536526629541"',
  storageCode: '"BuffaloWingsNThings"',
  primaryColor: '"#003784"',
  companyName: '"Buffalo\'s Wings N Things"',
  accountManagementURL: '"https://us-central1-buffalowings-dev.cloudfunctions.net/accounts"'
})