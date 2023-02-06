import { readFileSync } from 'fs'
import { resolve } from 'path'
import log from './logWriter'

export const getConstants = () => {
  try {
    const data = readFileSync(resolve('../../data/constants.json'))
    const constants = JSON.parse(data)
    log('readed constants', constants)

    return constants
  } catch (e) {
    log(e.message)
  }
}

export const getSettings = () => {
  try {
    const data = readFileSync(resolve('../../data/settings.json'))
    const constants = JSON.parse(data)
    log('readed settings', constants)

    return constants
  } catch (e) {
    log(e.message)
  }
}
