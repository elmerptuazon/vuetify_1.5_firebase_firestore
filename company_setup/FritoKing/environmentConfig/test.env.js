var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  projectId: '"my-natural-dev"',
  appId: '"1:943759044147:web:05877f812940998c837d46"',
  databaseURL: '"https://my-natural-dev.firebaseio.com"',
  storageBucket: '"my-natural-dev.appspot.com"',
  locationId: '"us-central"',
  apiKey: '"AIzaSyAfTZ44pssPxImQQ3IoHfUNZpWkEd8Zt48"',
  authDomain: '"my-natural-dev.firebaseapp.com"',
  messagingSenderId: '"943759044147"',
  storageCode: '"FritoKing"',
  primaryColor: '"#c11515"',
  companyName: '"Frito King"',
  accountManagementURL: '"https://us-central1-potatocornerdev.cloudfunctions.net/accounts"'
})
