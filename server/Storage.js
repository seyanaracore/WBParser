import { readFile, writeFile } from 'fs'
import { promisify } from 'util'

export default class Storage {
  data = {}
  dbFilePath = null
  readKey = null
  backupPath = null

  constructor(dbFilePath, readKey, backupPath) {
    this.dbFilePath = dbFilePath
    this.readKey = readKey
    this.backupPath = backupPath
  }

  async read(path = this.dbFilePath) {
    if (!path) throw Error('invalid path', path)
    const fileData = await this.#readAndParseFile(path)

    if (typeof fileData !== 'object')
      throw Error(`Key "${this.readKey}" of file ${this.dbFilePath} must contain an object.`)

    this.data = fileData
  }

  async write(data = this.data) {
    if (typeof data !== 'object') throw Error('invalidData')

    const promisifyWriteFile = promisify(writeFile)

    await promisifyWriteFile(this.dbFilePath, JSON.stringify(data))
  }

  async restore() {
    const fileData = await this.read(this.backupPath)

    console.log(fileData)
    return this.write(fileData)
  }

  async #readAndParseFile(path = this.dbFilePath) {
    if (!path) throw Error('no path')

    const promisifyReadFile = promisify(readFile)
    const fileText = await promisifyReadFile(path, { encoding: 'utf-8' })
    return JSON.parse(fileText)
  }
}
