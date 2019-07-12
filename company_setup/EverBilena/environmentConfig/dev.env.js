var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyCSx6lIrUmXflCVFe6DKktZwXuXvbfZtJk"',
  authDomain: '"ever-bilena-dev.firebaseapp.com"',
  databaseURL: '"https://ever-bilena-dev.firebaseio.com"',
  projectId: '"ever-bilena-dev"',
  storageBucket: '"ever-bilena-dev.appspot.com"',
  messagingSenderId: '"127418362624"',
  appId: '"1:127418362624:web:fe8dafbb3c63c6d9"',
  primaryColor: '"#D80072"',
})
