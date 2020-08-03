var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  apiKey: '"AIzaSyD4xk-R2E7hkJGl3T820hkmUiMxVP0LPVE"',
  authDomain: '"kayumanggiorganic-dev.firebaseapp.com"',
  databaseURL: '"https://kayumanggiorganic-dev.firebaseio.com"',
  projectId: '"kayumanggiorganic-dev"',
  storageBucket: '"kayumanggiorganic-dev.appspot.com"',
  messagingSenderId: '"316844676986"',
  appId: '"1:316844676986:web:57c7a5a119b451aafc68c3"',
  measurementId: '"G-XV2JER7LNT"',
  primaryColor: '"#4bb6d7"',
  companyName: '"Kayumanggi Organic Test App"',
  accountManagementURL: '"https://us-central1-appselltestapp.cloudfunctions.net/accounts"'
})
