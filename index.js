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

dbx.filesDownload({path: '/screenshot_2017-01-04-19-46-24.png'})
  .then(function(response){
    console.log(response)
  })
  .catch(function(error){
    console.log(error)
  })
