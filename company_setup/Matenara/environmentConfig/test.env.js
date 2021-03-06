var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  projectId: '"matenara-dev"',
  appId: '"1:127991740211:web:6a871c4a18b71e4515b046"',
  databaseURL: '"https://matenara-dev.firebaseio.com"',
  storageBucket: '"matenara-dev.appspot.com"',
  apiKey: '"AIzaSyDBakbW6inOUZAORsH6HQZBvbPKcmdmH3k"',
  authDomain: '"matenara-dev.firebaseapp.com"',
  messagingSenderId: '"127991740211"',
  measurementId: '"G-XV2JER7LNT"',
  primaryColor: '"#215e3f"',
  companyName: '"Matenara"',
  accountManagementURL: '"https://us-central1-matenara-dev.cloudfunctions.net/accounts"'
})
