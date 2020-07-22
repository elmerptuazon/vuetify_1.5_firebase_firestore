var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyByvdxHkznRrmeIDrUigzGEdrj3rPY4D1A"',
  authDomain: '"babae-dev.firebaseapp.com"',
  databaseURL: '"https://babae-dev.firebaseio.com"',
  projectId: '"babae-dev"',
  storageBucket: '"babae-dev.appspot.com"',
  messagingSenderId: '"719726296321"',
  appId: '"1:719726296321:web:18d79143ddd7577c1bef00"',
  measurementId: '"G-2N45LLZM5L"',
  primaryColor: '"#FF7F7F"',
  companyName: '"Babae"',
  accountManagementURL: '"https://us-central1-babae-dev.cloudfunctions.net/accounts"'
})