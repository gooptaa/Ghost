const Dropbox = require('dropbox');
const fs = require('fs')

let accessToken = require('./secrets').Dropbox.ACCESS_TOKEN

var dbx = new Dropbox({ accessToken: accessToken });

const findOrCreatePath = function(filepath, target, isFile){
  if (fs.existsSync(`${target}${filepath}`)) {
    if (isFile){
      console.log("we got here")
      fs.writeFile(`${target}${isFile.path_display}`, isFile, (err) => {
        if (err) {console.error(err)}
      })
    }
    else {return}
  }
  else fs.mkdirSync(`${target}${filepath}`)
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

module.exports = origin => (
  dbx.filesListFolder({path: origin, recursive: true})
    .then(response => response.entries)
    .then(entries => {
      console.log(entries)
      entries.forEach(entry => (
        detectAndHandleType(entry, './for_tests')
      ))
    })
    .catch(function(error) {
      console.log(error);
    })
  )

