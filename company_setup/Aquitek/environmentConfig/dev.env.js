var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyA4zklK3NZlZYcyiauQLyh6r9arzOY0rwA"',
  authDomain: '"aquitek-dev.firebaseapp.com"',
  databaseURL: '"https://aquitek-dev.firebaseio.com"',
  projectId: '"aquitek-dev"',
  storageBucket: '"aquitek-dev.appspot.com"',
  messagingSenderId: '"35058162171"',
  appId: '"1:35058162171:web:78997f77a22a95d347d35e"',
  measurementId: '"G-42XENWM4F9"',
  primaryColor: '"#2F2E32"',
})