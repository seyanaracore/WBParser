import fs from 'fs'

const removeFile = path =>
  new Promise((res, rej) => {
    fs.stat(path, function (err) {
      if (err) {
        return rej(err)
      }

      fs.unlink(path, function (err) {
        if (err) return rej(err)
        res(true)
      })
    })
  })

export default removeFile
