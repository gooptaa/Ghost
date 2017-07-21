// Required libraries:

const Dropbox = require('dropbox');
var fuse = require('fuse-bindings')

// Required modules:

const mountTree = require('./mountTree')

// User data (REPLACE THESE FIELDS):

const accessToken = require('./secrets').Dropbox.ACCESS_TOKEN
const mountPath = `/Users/Guptatron/Desktop/test`
const dbxOrigin = `/node`

// Initialize Dropbox:
var dbx = new Dropbox({ accessToken: accessToken });

// Initialize FUSE:

mountTree(mountPath, dbxOrigin)

process.on('SIGINT', function () {
  fuse.unmount(mountPath, function (err) {
    if (err) {
      console.log('filesystem at ' + mountPath + ' not unmounted')
      console.error(err)
    } else {
      console.log('filesystem at ' + mountPath + ' unmounted')
    }
  })
})
