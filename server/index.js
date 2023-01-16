import '@feathersjs/transport-commons'
import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'
// import { Server } from 'socket.io'
import { join, dirname } from 'path'

import Storage from './Storage.js'
import Respository from './Repository.js'
import RestController from './RestController.js'

async function runApp() {
  const appPort = 3030
  const __dirname = dirname(process.argv[1])

  const settingsDb = join(__dirname, '../data/settings.json')
  const settingsBackup = join(__dirname, '../data/settings.backup.json')
  const constantsDb = join(__dirname, '../data/constants.json')
  const constantsBackup = join(__dirname, '../data/constants.backup.json')

  const settingsStorage = new Storage(settingsDb, 'settings', settingsBackup)
  await settingsStorage.read()

  const constantsStorage = new Storage(constantsDb, 'constants', constantsBackup)
  await constantsStorage.read()

  const app = express(feathers())

  app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.header('Access-Control-Allow-Methods', '*')
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static('public'))
  app.configure(express.rest())

  app.use('/settings', new RestController(new Respository(settingsStorage)))
  app.use('/constants', new RestController(new Respository(constantsStorage)))
  app.use(express.errorHandler())

  app.listen(appPort).on('listening', () => {
    console.log(`Server started ${appPort}`)
  })

  app.on('error', () => {
    console.log('Failed to start server.')
  })

  // const io = new Server(app)

  // io.on('connection', (socket) => {
  //   console.log('a user connected')
  // })
}

runApp()
