var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyD23ijcGFb7rRq8sNeFNSbtWQy5Mif9iFU"',
  authDomain: '"chicharooms-dev.firebaseapp.com"',
  databaseURL: '"https://chicharooms-dev.firebaseio.com"',
  projectId: '"chicharooms-dev"',
  storageBucket: '"chicharooms-dev.appspot.com"',
  messagingSenderId: '"647750232063"',
  appId: '"1:647750232063:web:953265ef03a58585c6e9ca"',
  measurementId: '"G-GPPL3LX8VP"',
  primaryColor: '"#AA395D"',
})