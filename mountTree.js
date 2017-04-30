var fuse = require('fuse-bindings')
const fs = require('fs')
const mountPath = `./for_tests/mnt`
// const entries = require('./seed')

fuse.mount(mountPath, {
  force: true,
  readdir: function (path, cb) {
    console.log('readdir(%s)', path)
    let dir = fs.readdirSync(path)
    return cb(0, dir)
  },
  getattr: function (path, cb) {
    console.log('getattr(%s)', path)
    if (!fs.existsSync(path)) {cb(fuse.ENOENT)}
    else {
      let stat = fs.statSync(path)
      console.log("stat here: ", stat)
      if (stat) {
        cb(0, stat)
        return
      }
    }
    // if (path === '/') {
    //   cb(0, {
    //     mtime: new Date(),
    //     atime: new Date(),
    //     ctime: new Date(),
    //     size: 100,
    //     mode: 16877,
    //     uid: process.getuid ? process.getuid() : 0,
    //     gid: process.getgid ? process.getgid() : 0
    //   })
    //   return
    // }

    // // if (path === '/test') {
    //   else {
    //   cb(0, {
    //     mtime: new Date(),
    //     atime: new Date(),
    //     ctime: new Date(),
    //     size: 12,
    //     mode: 33188,
    //     uid: process.getuid ? process.getuid() : 0,
    //     gid: process.getgid ? process.getgid() : 0
    //   })
    //   return
    // }

    // cb(fuse.ENOENT)
  },
  open: function (path, flags, cb) {
    console.log('open(%s, %d)', path, flags)
    let descriptor = fs.openSync(path, flags)
    cb(0, descriptor) // 42 is an fd
  },
  read: function (path, fd, buf, len, pos, cb) {
    console.log('read(%s, %d, %d, %d)', path, fd, len, pos)
    // var str = 'hello world\n'.slice(pos, pos + len)
    let bytesRead = fs.readSync(fd, buf, 0, len, pos)
    return cb(bytesRead)
  },
  write: function (path, fd, buffer, length, position, cb) {
    console.log('writing', buffer.slice(0, length))
    let bytesWritten = fs.writeSync(fd, buf, 0, len, pos)
    cb(bytesWritten) // we handled all the data
  }
}, function (err) {
  if (err) throw err
  console.log('filesystem mounted on ' + mountPath)
})

process.on('SIGINT', function () {
  fuse.unmount(mountPath, function (err) {
    if (err) {
      console.log('filesystem at ' + mountPath + ' not unmounted', err)
    } else {
      console.log('filesystem at ' + mountPath + ' unmounted')
    }
  })
})
