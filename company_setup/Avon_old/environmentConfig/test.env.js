var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  apiKey: '"AIzaSyAeMzGe0okkodRmZZCExzhn96Y6-V1766s"',
  authDomain: '"avon-dev-b9664.firebaseapp.com"',
  databaseURL: '"https://avon-dev-b9664.firebaseio.com"',
  projectId: '"avon-dev-b9664"',
  storageBucket: '"avon-dev-b9664.appspot.com"',
  messagingSenderId: '"879985541901"',
  appId: '"1:879985541901:web:f0aaf0ffddb56a05a46644"',
  primaryColor: '"#ED008C"',
})
