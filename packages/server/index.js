import '@feathersjs/transport-commons'
import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'
import { join, dirname } from 'path'
import open from 'open'
import Storage from './components/Storage.js'
import Repository from './components/Repository.js'
import RestController from './components/RestController.js'
import { APP_PORT } from './constants/index.js'
import ParserRepository from './components/ParserRepository.js'

const url = `http://localhost:${APP_PORT}`

async function runApp() {
  const __dirname = dirname(process.argv[1])

  const settingsDb = join(__dirname, 'data', 'settings.json')
  const settingsBackup = join(__dirname, 'data', 'settings.backup.json')
  const constantsDb = join(__dirname, 'data', 'constants.json')
  const constantsBackup = join(__dirname, 'data', 'constants.backup.json')

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

  app.use('/settings', new RestController(new Repository(settingsStorage)))
  app.use('/constants', new RestController(new Repository(constantsStorage)))
  app.use('/parser', new RestController(new ParserRepository()))
  app.use(express.errorHandler())

  app.listen(APP_PORT).on('listening', () => {
    console.log(`Парсер доступен по ссылке: ${url}`)

    open(url)
  })

  app.get('/', (req, res) => {
    res.send(join(__dirname, 'public/index.html'))
  })

  app.on('error', () => {
    console.log('Failed to start server.')
  })
}

runApp()
