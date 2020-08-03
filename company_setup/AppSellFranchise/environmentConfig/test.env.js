var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  projectId: '"appsellfranchise"',
  appId: '"1:1069219513340:web:640e8dbeaebfecf8ee2879"',
  databaseURL: '"https://appsellfranchise.firebaseio.com"',
  storageBucket: '"appsellfranchise.appspot.com"',
  apiKey: '"AIzaSyBp7LvQJL0PjA1mtrDGk7SvN_OUAK9RJqQ"',
  authDomain: '"appsellfranchise.firebaseapp.com"',
  messagingSenderId: '"1069219513340"',
  storageCode: '"AppSellFranchise"',
  primaryColor: '"#d66807"',
  companyName: '"AppSell Demo App"',
  accountManagementURL: '"https://us-central1-appsellfranchise.cloudfunctions.net/accounts"'
})
