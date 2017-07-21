const Dropbox = require('dropbox');
const fs = require('fs')

let accessToken = require('./secrets').Dropbox.ACCESS_TOKEN
var dbx = new Dropbox({ accessToken: accessToken });

const findOrCreatePath = function(filepath, target, isFile = null){
  const pathTree = filepath.split('/')
  let subTargetPath = target.slice()
  for (let i = 1; i < pathTree.length; i++) {
    let subPath = pathTree[i]
    if (!fs.existsSync(`${subTargetPath}/${subPath}`)){
      fs.mkdirSync(`${subTargetPath}/${subPath}`)
    }
    subTargetPath += `/${subPath}`
  }
  if (isFile){
    fs.writeFile(`${target}${isFile.path_display}`, isFile, (err) => {
      if (err) {console.error(err)}
    })
  }
}

const detectAndHandleType = function(entry, target) {
  let tag = entry['.tag']
  if (tag === 'folder') {return handleFolder(entry, target)}
  if (tag === 'file') {return handleFile(entry, target)}
  else {console.error('Unknown type')}
}

const handleFolder = function(folder, target) {
  findOrCreatePath(folder.path_display, target, null)
}

const handleFile = function(file, target) {
  let endPoint = file.path_display.indexOf(file.name)
  let filepath = file.path_display.slice(0, endPoint)
  findOrCreatePath(filepath, target, file)
}

const continueBuildingTree = ({cursor, target}) => {
  let next = null
  dbx.filesListFolderContinue({cursor})
    .then(data => {
      if (data.has_more) {
        next = data.cursor
      }
      return data.entries
    })
    .then(entries =>
      entries.forEach(entry => (
        detectAndHandleType(entry, target)
      )))
    .then(() => {
      if (next) {
        continueBuildingTree({cursor: next, target})
      }
    })
    .catch(function(error) {
      console.log(error);
    })
  }

module.exports = (origin, target) => {
  let next = null
  dbx.filesListFolder({path: origin, recursive: true})
    .then(data => {
      if (data.has_more) {
        next = data.cursor
      }
      return data.entries
    })
    .then(entries =>
      entries.forEach(entry => (
        detectAndHandleType(entry, target)
      )))
    .then(() => {
      if (next) {
        continueBuildingTree({cursor: next, target})
      }
    })
    .catch(function(error) {
      console.log(error);
    })
  }

