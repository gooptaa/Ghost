const Dropbox = require('dropbox');
const fs = require('fs')

let accessToken = require('./secrets').Dropbox.ACCESS_TOKEN

var dbx = new Dropbox({ accessToken: accessToken });

dbx.filesListFolder({path: ''})
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });

