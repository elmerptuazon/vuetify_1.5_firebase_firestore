var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  apiKey: '"AIzaSyByvdxHkznRrmeIDrUigzGEdrj3rPY4D1A"',
  authDomain: '"babae-dev.firebaseapp.com"',
  databaseURL: '"https://babae-dev.firebaseio.com"',
  projectId: '"babae-dev"',
  storageBucket: '"babae-dev.appspot.com"',
  messagingSenderId: '"719726296321"',
  appId: '"1:719726296321:web:18d79143ddd7577c1bef00"',
  measurementId: '"G-2N45LLZM5L"',
  primaryColor: '"#FF7F7F"',
})
