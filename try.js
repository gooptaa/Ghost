const Dropbox = require('dropbox');
const fs = require('fs')

let accessToken = require('./secrets').Dropbox.ACCESS_TOKEN

var dbx = new Dropbox({ accessToken: accessToken });

const findOrCreatePath = function(filepath, target, isFile = null){
  const pathTree = filepath.split('/')
  let subTargetPath = target.slice()
  for (let i = 1; i < pathTree.length; i++) {
    let subPath = pathTree[i]
    if (!fs.existsSync(`${subTargetPath}${subPath}`)){
      fs.mkdirSync(`${subTargetPath}${subPath}`)
    }
    subTargetPath += subPath
  }
  if (isFile){
    fs.writeFile(`${target}${isFile.path_display}`, isFile, (err) => {
      if (err) {console.error(err)}
    })
  }
}

// dbx.filesListFolder({path: '', recursive: true})
//   .then(function(response) {
//     console.log(response.entries)
//     console.log(response.entries[response.entries.length -1])
//   })
//   .catch(function(error) {
//     console.log(error);
//   });

//   dbx.usersGetCurrentAccount()
//     .then(data => console.log(data))

//   dbx.usersGetAccount({account_id: 'dbid:AABdCemTeCOveuO1eIabnveODzIfCBRjQvk'})
//     .then(data => console.log(data))

// find or create, old version:
// const findOrCreatePath = function(filepath, target, isFile = null){
//   if (fs.existsSync(`${target}${filepath}`)) {
//     if (isFile){
//       console.log("we got here")
//       fs.writeFile(`${target}${isFile.path_display}`, isFile, (err) => {
//         if (err) {console.error(err)}
//       })
//     }
//     else {return}
//   }
//   else fs.mkdirSync(`${target}${filepath}`)
// }

// build tree, old version
// module.exports = (origin, target) => {
//   dbx.filesListFolder({path: origin, recursive: true})
//     .then(response => response.entries)
//     .then(entries => {
//       entries.forEach(entry => (
//         detectAndHandleType(entry, target)
//       ))
//     })
//     .catch(function(error) {
//       console.log(error);
//     })
//   }
