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

// const mountPath = `/Users/Guptatron/FullStack/Senior Phase/Stackathon/Ghost/for_tests/mnt`
const mountPath = `/Users/Guptatron/Desktop/test`
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
    console.log('READ ARGUMENTS HERE: pth: ', pth, 'fd: ', fd, 'buf: ', buf, 'len: ', len, 'pos: ', pos)
    dbx.filesGetTemporaryLink({path: pth})
      .then(data => {
        let rawData
        let dataString;
        https.get(data.link, (res) => {
          res.on('data', (chunk) => {
            dataString += chunk
          })
          res.on('end', () => {
            rawData = new Buffer(dataString)
            if (pos >= rawData.length){
              return cb(0)
            }
            var part = rawData.slice(pos, pos + len)
            part.copy(buf)
            cb(part.length)
          })
        })
      })
      .catch(err => cb(fuse[err.code]))
  },
  write: function (pth, fd, buf, len, pos, cb) {
    pth = pth === '/' ? dbxOrigin : dbxOrigin + pth
    console.log('writing: ', buf.slice(0, length))
    dfs.writeFile(pth, buf, (err) => {
      if (err) {return cb(fuse[err.code])}
      else {return cb(len)}
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
const callback = (err) => {
  if (err) {
    fuse.unmount(mountPath, (er) => {
      if (er) {console.log('Error unmounting: ', er)}
    })
    console.log('Error mounting; unmounted. Error: ', err)}
  console.log('filesystem mounted on ' + mountPath)
}

// Send implementation to index.js:

module.exports = (dbxOrigin) => {
  fuse.mount(mountPath, ops(dbxOrigin), callback)
}

dfs.readdir('/node', (err, result) => {
      if (err) {console.log(err)}
      else {
        let stats = {
          mtime: result.client_modified ? result.client_modified : new Date(),
          atime: result.client_modified ? result.client_modified : new Date(),
          ctime: result.client_modified ? result.client_modified : new Date(),
          size: result.size ? result.size : 100,
          uid: process.getuid ? process.getuid() : 0,
          gid: process.getgid ? process.getgid() : 0
        }
        console.log(result)}
    })
