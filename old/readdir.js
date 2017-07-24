// READDIR:

// Initialize Dropbox:

const Dropbox = require('dropbox');
let accessToken = require('../secrets').Dropbox.ACCESS_TOKEN
var dbx = new Dropbox({ accessToken: accessToken });


const readdirContinue = ({cursor, files}) => {
  let next = null
  dbx.filesListFolderContinue({cursor})
    .then(data => {
      if (data.has_more) {
        next = data.cursor
      }
      return data.entries
    })
    .then(entries =>
      entries.forEach(entry => files.push(entry.name)))
    .then(() => {
      if (next) {
        return readdirContinue({cursor: next, files})
      }
      else {
        return files
      }
    })
    .catch(function(error) {
      console.log(error);
    })
  }

const readdir = (pth) => {
  let files = []
  dbx.filesListFolder({path: pth, recursive: false})
    .then(data => {
      data.entries.forEach(entry => files.push(entry.name))
      if (data.has_more) {
        return readdirContinue({cursor: data.cursor, files})
        }
      else {
        return files
      }
    })
    .catch(function(error) {
      console.log(error);
    })
}


module.exports = (pth) => {
  dbx.filesListFolder({path: pth, recursive: false})
    .then(data => data.entries)
    .then(entries => {
      return entries.reduce(function(curr, next){
        curr.push(next.name)
        return curr
      }, [])
    })
    .then(files => {
      return files
    })
    .catch((err) => console.error(err))
}

dbx.filesListFolder({path: '/node', recursive: false})
    .then(data => data.entries)
    .then(entries => {
      return entries.reduce(function(curr, next){
        curr.push(next.name)
        return curr
      }, [])
    })
    .then(files => {
      return files
    })
    .catch((err) => console.error(err))
