var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyAyIGrN6sdHpZciGeZE7c1__qdMaA0N9wI"',
  authDomain: '"mother-nature-dev.firebaseapp.com"',
  databaseURL: '"https://mother-nature-dev.firebaseio.com"',
  projectId: '"mother-nature-dev"',
  storageBucket: '"mother-nature-dev.appspot.com"',
  messagingSenderId: '"923236145582"',
  appId: '"1:923236145582:web:073a7ed83eda71fdcf103f"',
  measurementId: '"G-QWTXNCX24B"',
  primaryColor: '"#9fc45c"',
  companyName: '"Mother Nurture"',
  accountManagementURL: '"https://us-central1-mother-nature-dev.cloudfunctions.net/accounts"'
})