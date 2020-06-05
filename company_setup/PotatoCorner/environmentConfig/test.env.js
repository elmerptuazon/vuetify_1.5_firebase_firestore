var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
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
  accountManagementURL: '"https://us-central1-potatocornerdev.cloudfunctions.net/accounts"'
})
