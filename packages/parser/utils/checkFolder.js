import fs from "fs"

const checkFolder = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export default checkFolder
