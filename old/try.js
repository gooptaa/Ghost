const fs = require('fs')
const https = require('https')
const fuse = require('fuse-bindings')
const Dropbox = require('dropbox');
let accessToken = require('../secrets').Dropbox.ACCESS_TOKEN
var dbx = new Dropbox({ accessToken: accessToken });
const readdir = require('./readdir')
// function(file) => wrapper(file)
// fs.writeFile(file+'.command', )...

// file: {name, path, id, size}

const mountPath = `/Users/Guptatron/FullStack/Ghost/for_tests/mnt`
const pth = '/node'

dbx.filesGetTemporaryLink({path: '/node/resume.pdf'})
  .then(data => {
    let rawData
    let dataString = ''
      https.get(data.link, (res) => {
        const newFile = fs.createWriteStream('/Users/Guptatron/Desktop/resume')
        res.pipe(newFile)
        // res.setEncoding('utf8')
        // res.on('data', (chunk) => {
        //   dataString += chunk
        // })
        // res.on('end', () => {
        //   try {
        //     rawData = Buffer.from(dataString)
        //     // if (pos >= rawData.length){
        //     //   return cb(0)
        //     // }
        //     // var part = rawData.slice(pos, pos + len)
        //     // part.copy(buf)
        //     // cb(part.length)
        //     fs.writeFile(`/Users/Guptatron/Desktop/resume`, rawData, (err) => {
        //       if (err) {throw err}
        //     })
        //   }
        //   catch (e) {
        //     console.log("THERE WAS AN ERROR: ", e, e.message)
        //   }
        // })
      }).on('error', e => {
        console.log("THERE WAS AN ERROR: ", e.message)
      })
  })
  .catch(err => console.log(err))


// dbx.filesGetMetadata({path: '/node/Screenshot_2017-01-04-19-46-24.png'})
//   .then(data => {
//     console.log(data)
//   })
