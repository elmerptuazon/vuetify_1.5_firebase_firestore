var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyA1p43Hys8LeHoqINSFOItJDEHLmggy4C4"',
  authDomain: '"potatocornerdev.firebaseapp.com"',
  databaseURL: '"https://potatocornerdev.firebaseio.com"',
  projectId: '"potatocornerdev"',
  storageBucket: '"potatocornerdev.appspot.com"',
  messagingSenderId: '"846971526982"',
  appId: '"1:846971526982:web:027bf465e5be6cc53e8f47"',
  storageCode: '"PotatoCorner"',
  primaryColor: '"#119247"',
  companyName: '"Potato Corner"',
  verificationGeneratorURL: '"https://us-central1-potatocornerdev.cloudfunctions.net/accounts/sendAccountVerification"'
})