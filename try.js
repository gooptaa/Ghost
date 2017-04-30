const Dropbox = require('dropbox');
const fs = require('fs')

let accessToken = require('./secrets').Dropbox.ACCESS_TOKEN

var dbx = new Dropbox({ accessToken: accessToken });

// function(file) => wrapper(file)
// fs.writeFile(file+'.command', )...

// file: {name, path, id, size}

const wrapper = function (metaData) {

}



