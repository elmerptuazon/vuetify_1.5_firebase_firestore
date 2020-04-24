var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
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
