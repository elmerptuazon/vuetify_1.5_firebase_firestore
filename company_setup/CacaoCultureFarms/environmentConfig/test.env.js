var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  apiKey: '"AIzaSyD81CLcl4T50SweMxMyCy_r-vvq-3h5cCg"',
  authDomain: '"cacaoculturefarms-dev.firebaseapp.com"',
  databaseURL: '"https://cacaoculturefarms-dev.firebaseio.com"',
  projectId: '"cacaoculturefarms-dev"',
  storageBucket: '"cacaoculturefarms-dev.appspot.com"',
  messagingSenderId: '"26371903278"',
  appId: '"1:26371903278:web:850ae7581232b3484bb4bf"',
  measurementId: '"G-XV2JER7LNT"',
  primaryColor: '"#b81212"',
})
