// Required libraries:

var fuse = require('fuse-bindings')
const fs = require('fs')
const https = require('https')

// Initialize Dropbox FUSE bindings:

let accessToken = require('./secrets').Dropbox.ACCESS_TOKEN
const Dropbox = require('dropbox');
var dbx = new Dropbox({ accessToken: accessToken });
const dfs = require('dropbox-fs')({
    apiKey: accessToken
    });

// Argument definitions for FUSE:

const ops = (dbxOrigin) => ({
  options: ['daemon_timeout=5', 'debug', 'auto_cache'],
  force: true,
  displayFolder: true,
  access: function(pth, mode, cb) {
    return cb(0)
  },
  statfs: function (pth, cb) {
    return cb(0, {
      bsize: 1000000,
      frsize: 1000000,
      blocks: 1000000,
      bfree: 1000000,
      bavail: 1000000,
      files: 1000000,
      ffree: 1000000,
      favail: 1000000,
      fsid: 1000000,
      flag: 1000000,
      namemax: 1000000
    })
  },
  readdir: function (pth, cb) {
    pth = pth === '/' ? dbxOrigin : dbxOrigin + pth
    dbx.filesListFolder({path: '/node', recursive: false})
    .then(data => {
      let files = data.entries.reduce((curr, next) => {
        curr.push(next.name)
        return curr
      }, [])
      while (data.has_more){
        dbx.filesListFolderContinue({cursor: data.cursor})
          .then(nextData => {
            let nextFiles = nextData.entries.reduce((curr, next) => {
              curr.push(next.name)
              return curr
            }, [])
            if (!nextData.has_more){
              data.has_more = false
            }
            files = files.concat(nextFiles)
          })
      }
      return cb(0, files)
    })
    .catch((err) => cb(fuse[err.code]))
  },
  getattr: function (pth, cb) {
    pth = pth === '/' ? dbxOrigin : dbxOrigin + pth
    dbx.filesGetMetadata({path: pth})
      .then(data => {
        let stats = {
          mtime: data.client_modified ? data.client_modified : new Date(),
          atime: data.client_modified ? data.client_modified : new Date(),
          ctime: data.client_modified ? data.client_modified : new Date(),
          size: data.size ? data.size : 100,
          mode: data.size ? 33188 : 16877,
          uid: process.getuid ? process.getuid() : 0,
          gid: process.getgid ? process.getgid() : 0
        }
        return cb(0, stats)
      })
      .catch(err => cb(fuse[err.code]))
  },
  read: function (pth, fd, buf, len, pos, cb) {
    pth = pth === '/' ? dbxOrigin : dbxOrigin + pth
    dbx.filesGetTemporaryLink({path: pth})
      .then(data => {
        let rawData
        let dataString;
        https.get(data.link, (res) => {
          res.on('data', (chunk) => {
            dataString += chunk
          })
          res.on('end', () => {
            rawData = Buffer.from(dataString)
            if (pos >= rawData.length){
              return cb(0)
            }
            var part = rawData.slice(pos, pos + len)
            let bytesRead = part.copy(buf, pos)
            cb(bytesRead)
          })
        })
      })
      .catch(err => cb(fuse[err.code]))
  },
  write: function (pth, fd, buf, len, pos, cb) {
    pth = pth === '/' ? dbxOrigin : dbxOrigin + pth
    dbx.filesGetTemporaryLink({path: pth})
      .then(data => {
        let rawData, dataString;
        https.get(data.link, (res) => {
          res.on('data', (chunk) => {
            dataString += chunk
          })
          res.on('end', () => {
            rawData = Buffer.from(dataString)
            let newFile = rawData.slice(0, pos).concat(buf).concat(rawData.slice(pos + len))
            dbx.filesUploadSessionStart({contents: newFile, close: true})
          })
        })
      })
  },
  mkdir: function(pth, mode, cb) {
    pth = pth === '/' ? dbxOrigin : dbxOrigin + pth
    dbx.filesCreateFolder({path: pth, autorename: true})
      .then(() => cb(0))
      .catch(err => cb(fuse[err.code]))
  },
  rmdir: function(pth, cb) {
    pth = pth === '/' ? dbxOrigin : dbxOrigin + pth
    dbx.filesDelete({path: pth})
      .then(() => cb(0))
      .catch(err => cb(fuse[err.code]))
  },
  rename: function(src, dest, cb) {
    dbx.filesMove({from_path: src, to_path: dest, autorename: true})
      .then(() => cb(0))
      .catch(err => cb(fuse[err.code]))
  }
})
const callback = (mountPath) => (err) => {
  if (err) {
    fuse.unmount(mountPath, (er) => {
      if (er) {console.log('Error unmounting: ', er)}
    })
    console.log('Error mounting; unmounted. Error: ', err)}
  console.log('filesystem mounted on ' + mountPath)
}

// Send implementation to index.js:

module.exports = (mountPath, dbxOrigin) => {
  fuse.mount(mountPath, ops(dbxOrigin), callback(mountPath))
}
