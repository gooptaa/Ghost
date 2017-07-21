fuse.mount(mountPath, {
  options: ['daemon_timeout=5', 'debug', 'auto_cache'],
  force: true,
  // access: function (pth, mode, cb) {
  //   pth = mountPath + pth
  //   fs.access(pth, mode, (err) => {
  //     if (err) {return cb(fuse[err.code])}
  //     else {return cb(0)}
  //   })
  // },
  readdir: function (pth, cb) {
    pth = mountPath + pth
    console.log('readdir(%s)', pth)
    dfs.readdir(pth, (err, result) => {
      if (err) {return cb(fuse[err.code])}
      else {return cb(0, result)}
    })
  },
  getattr: function (pth, cb) {
    pth = mountPath + pth
    console.log('getattr', pth)
    dfs.stat(pth, (err, stats) => {
      if (err) {cb(fuse[err.code])}
      else {return cb(0, stats)}
    })
  },
  // open: function (pth, flags, cb) {
  //   pth = mountPath + pth
  //   console.log('open(%s, %d)', pth, flags)
  //   fs.realpath(pth, (er, resPth) => {
  //     if (er) {resPth = pth.slice()}
  //     fs.open(resPth, flags, (err, descriptor) => {
  //       if (err) {return cb(fuse[err.code])}
  //       else {return cb(0, descriptor)}
  //     })
  //   })
  // },
  // opendir: function(pth, flags, cb) {
  //   pth = mountPath + pth
  //   fs.realpath(pth, (er, resPth) => {
  //     if (er) {resPth = pth.slice}
  //     fs.open(resPth, flags, (err, descriptor) => {
  //       if (err) {return cb(fuse[err.code])}
  //       else {return cb(0, descriptor)}
  //     })
  //   })
  // },
  // release: function (pth, fd, cb) {
  //   fs.close(fd, (err) => {
  //     if (err) {return cb(fuse[err.code])}
  //     else {return cb(0)}
  //   })
  // },
  // releasedir: function (pth, fd, cb) {
  //   fs.close(fd, (err) => {
  //     if (err) {return cb(fuse[err.code])}
  //     else {return cb(0)}
  //   })
  // },
  read: function (pth, fd, buf, len, pos, cb) {
    pth = mountPath + pth
    console.log('read(%s, %d, %d, %d)', pth, fd, len, pos)
    // var str = 'hello world\n'.slice(pos, pos + len)
    dfs.readFile(pth, (err, result) => {
      if (err) {return cb(fuse[err.code])}
      else {
        var part = result.slice(pos, pos + len)
        part.copy(buf)
        cb(part.length)
      }
    })
  },
  write: function (pth, fd, buf, len, pos, cb) {
    pth = mountPath + pth
    console.log('writing', buf.slice(0, length))
    dfs.writeFile(pth, buf, (err) => {
      if (err) {return cb(fuse[err.code])}
      else {return cb(len)}
    })
  },
  mkdir: function(pth, mode, cb) {
    pth = mountPath + pth
    dfs.mkdir(pth, (err) => {
      if (err) {return cb(fuse[err.code])}
      else {return cb(0)}
    })
  },
  rmdir: function(pth, cb) {
    pth = mountPath + pth
    dfs.rmdir(pth, err => {
      if (err) {return cb(fuse[err.code])}
    })
  },
  rename: function(src, dest, cb) {
    dfs.rename(src, dest, (err) => {
      if (err) {return cb(fuse[err.code])}
    })
  }
}, function (err) {
  if (err) throw err
  console.log('filesystem mounted on ' + mountPath)
})

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
