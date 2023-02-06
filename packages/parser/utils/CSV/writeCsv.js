import iconv from 'iconv-lite'
import fs from 'fs'
import * as nPath from 'path'
import { createObjectCsvStringifier } from 'csv-writer'
import { DEFAULT_DELIMITER, DEFAULT_ENCODE } from '../constants.js'
import { validateCSVHeaders } from '../validators.js'
import checkFolder from '../checkFolder.js'

const getDir = path =>
  path
    .split(nPath.sep)
    .slice(0, path.split(nPath.sep).length - 1)
    .join(nPath.sep)

class writeCSVStream {
  filePath = ''

  constructor(path, headers, del = DEFAULT_DELIMITER) {
    validateCSVHeaders(headers)

    const dir = getDir(path)
    checkFolder(dir)
    this.filePath = path

    this.ws = fs.createWriteStream(path, {
      flags: 'a',
    })
    this.csvStringifier = createObjectCsvStringifier({
      header: headers,
      fieldDelimiter: del,
    })
    this.ws.write(this.csvStringifier.getHeaderString())
  }

  static getHeaders(obj) {
    return Object.keys(obj).map(el => ({ id: el, title: el }))
  }

  write(data) {
    const formatted = this.csvStringifier.stringifyRecords(data)
    const encoded = iconv.encode(formatted, DEFAULT_ENCODE)
    this.ws.write(encoded)
  }
}

export default writeCSVStream
