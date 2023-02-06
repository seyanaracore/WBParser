import path from 'path'
import fs from 'fs'

const ROOT_PATH =
  process.env?.NX_WORKSPACE_ROOT || '/Users/seyanaracore/Documents/Projects/WBParser'
const CONSTANTS_PATH = path.resolve(ROOT_PATH, 'packages', 'server', 'data', 'constants.json')
const constantsContent = fs.readFileSync(CONSTANTS_PATH, { encoding: 'utf-8' })
const constsData = JSON.parse(constantsContent)
constsData.DEFAULT_OUT_PATH.value = path.resolve(ROOT_PATH, constsData.DEFAULT_OUT_PATH.value)
constsData.DEFAULT_LOGS_PATH.value = path.resolve(ROOT_PATH, constsData.DEFAULT_LOGS_PATH.value)
export const constants = constsData

const SETTINGS_PATH = path.resolve(ROOT_PATH, 'packages', 'server', 'data', 'settings.json')
const settingsContent = fs.readFileSync(SETTINGS_PATH, { encoding: 'utf-8' })
export const settings = JSON.parse(settingsContent)
