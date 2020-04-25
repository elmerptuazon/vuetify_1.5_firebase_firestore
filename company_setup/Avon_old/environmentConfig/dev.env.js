var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  apiKey: '"AIzaSyAeMzGe0okkodRmZZCExzhn96Y6-V1766s"',
  authDomain: '"avon-dev-b9664.firebaseapp.com"',
  databaseURL: '"https://avon-dev-b9664.firebaseio.com"',
  projectId: '"avon-dev-b9664"',
  storageBucket: '"avon-dev-b9664.appspot.com"',
  messagingSenderId: '"879985541901"',
  appId: '"1:879985541901:web:f0aaf0ffddb56a05a46644"',
  primaryColor: '"#ED008C"',
})