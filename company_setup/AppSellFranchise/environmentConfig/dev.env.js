var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  projectId: '"fritoking-dev"',
  appId: '"1:200493591511:web:086dcbfe7f53d720aef992"',
  databaseURL: '"https://fritoking-dev.firebaseio.com"',
  storageBucket: '"fritoking-dev.appspot.com"',
  apiKey: '"AIzaSyAKjz6J06tTgQHM4kqnTod45eOkXR9_NOQ"',
  authDomain: '"fritoking-dev.firebaseapp.com"',
  messagingSenderId: '"200493591511"',
  storageCode: '"FritoKing"',
  primaryColor: '"#c11515"',
  companyName: '"Frito King"',
  accountManagementURL: '"https://us-central1-fritoking-dev.cloudfunctions.net/accounts"'
})