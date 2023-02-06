import getDateAndTime from './currentDate.js'
import fs from 'fs'
import { EOL } from 'os'
import { join } from 'path'
import { DEFAULT_LOGS_PATH } from './constants.js'
import { socket } from '../index.js'

const stream = fs.createWriteStream(join(DEFAULT_LOGS_PATH, getDateAndTime() + '.log'))

const log = (data, type) => {
  if (socket) socket.emit('log', { value: data, type: +type })
  stream.write(data + EOL)
}

export default log
