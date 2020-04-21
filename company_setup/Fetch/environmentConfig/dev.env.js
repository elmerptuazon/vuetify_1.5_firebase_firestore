var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyDboEkHtRlIxudB7NIHyC-H3aFKswLfReA"',
  authDomain: '"fetch-dev-a1f39.firebaseapp.com"',
  databaseURL: '"https://fetch-dev-a1f39.firebaseio.com"',
  projectId: '"fetch-dev-a1f39"',
  storageBucket: '"fetch-dev-a1f39.appspot.com"',
  messagingSenderId: '"769658614979"',
  appId: '"1:769658614979:web:0c1b3f1f986ddc1c0cde76"',
  primaryColor: '"#C6863F"',
  lalamoveURL: '"https://us-central1-fetch-dev-a1f39.cloudfunctions.net/lalamoveAPI"'
})