// Required libraries:

const Dropbox = require('dropbox');
const fs = require('fs')
var fuse = require('fuse-bindings')

// Required modules:

const buildTree = require('./buildTree')
const mountTree = require('./mountTree')
const mountPath = `/Users/Guptatron/Desktop/test`


// Initialize Dropbox:

let accessToken = require('./secrets').Dropbox.ACCESS_TOKEN
var dbx = new Dropbox({ accessToken: accessToken });

mountTree('/node')

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

// buildTree('/node', './for_tests/mnt')


// console.log(dbx.filesGetMetadata({path: '/node/resume.pdf'})
//   .then(function(response){
//     console.log(response)
//   }))


// dbx.filesListFolder({path: '/node'})
//   .then(function(response) {
//     console.log(response);
//   })
//   .catch(function(error) {
//     console.log(error);
//   });

// dbx.filesDownload({path: '/screenshot_2017-01-04-19-46-24.png'})
//   .then(function(response){
//     fs.writeFile(`./for_tests/${response.name}`, response.fileBinary, 'binary', (err) => {
//       if (err) throw err
//     })
//     console.log(Object.keys(response))
//   })
//   .catch(function(error){
//     console.log(error)
//   })
