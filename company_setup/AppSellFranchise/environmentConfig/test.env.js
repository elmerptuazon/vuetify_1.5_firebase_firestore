var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  projectId: '"fritoking-dev"',
  appId: '"1:200493591511:web:086dcbfe7f53d720aef992"',
  databaseURL: '"https://fritoking-dev.firebaseio.com"',
  storageBucket: '"fritoking-dev.appspot.com"',
  apiKey: '"AIzaSyAKjz6J06tTgQHM4kqnTod45eOkXR9_NOQ"',
  authDomain: '"fritoking-dev.firebaseapp.com"',
  messagingSenderId: '"200493591511"',
  storageCode: '"AppSellFranchise"',
  primaryColor: '"#d66807"',
  companyName: '"AppSell Franchise"',
  accountManagementURL: '"https://us-central1-fritoking-dev.cloudfunctions.net/accounts"'
})
