import * as feathersjs from '@feathersjs/errors'
import { spawn } from 'child_process'
import * as path from 'path'

const ROOT_PATH = process.env?.NX_WORKSPACE_ROOT
const parserPath = path.resolve(ROOT_PATH, 'packages/parser/index.js')

export default class ParserRepository {
  parser = null

  async get() {
    if (this.parser) return false

    this.parser = spawn(`node`, [parserPath])

    return { started: true }
  }

  async stop() {
    if (this.parser) {
      this.parser.kill('SIGINT')
      this.parser = null
    }
    return true
  }

  async isParsing() {
    return !!this.parser
  }

  async set({ linksList }) {
    if (this.parser) return false

    if (linksList && !Array.isArray(linksList))
      throw new feathersjs.BadRequest(`awaiting links list`)

    this.parser = spawn(`node`, [parserPath])

    this.parser.on('error', error => {
      console.log(`error: ${error.message}`)
      this.stop()
    })

    this.parser.on('close', () => {
      this.parser = null
    })

    return { started: true }
  }
}
