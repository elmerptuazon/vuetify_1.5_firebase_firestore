var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  projectId: '"bwl-group"',
  appId: '"1:801256472722:web:89e179e4e560b2afe1264b"',
  databaseURL: '"https://bwl-group.firebaseio.com"',
  storageBucket: '"bwl-group.appspot.com"',
  locationId: '"us-central"',
  apiKey: '"AIzaSyAvy2VDqvAujezudvFgKjnd_TbKhi7irUs"',
  authDomain: '"bwl-group.firebaseapp.com"',
  messagingSenderId: '"801256472722"',
  storageCode: '"PickUpSticks"',
  primaryColor: '"#f78e20"',
  companyName: '"Pick Up Sticks"',
  accountManagementURL: '"https://us-central1-bwl-group.cloudfunctions.net/accounts"'
})
