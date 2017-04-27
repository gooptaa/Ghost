const Dropbox = require('dropbox');

let accessToken = require('./secrets').Dropbox.ACCESS_TOKEN

// var dbx = new Dropbox({ accessToken: 'YOUR_ACCESS_TOKEN_HERE' });
// dbx.filesListFolder({path: ''})
//   .then(function(response) {
//     console.log(response);
//   })
//   .catch(function(error) {
//     console.log(error);
//   });

console.log(accessToken)
