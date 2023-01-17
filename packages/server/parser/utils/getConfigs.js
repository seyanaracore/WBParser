import { readFileSync, path } from 'fs'
import { log } from '../utils/logWriter'

export const getConstants = () => {
	try {
		const data = readFileSync(path.resolve('../../data/constants.json'))
		const constants = JSON.parse(data)
		log('readed constants', constants)

		return constants
	} catch (e) {
		log(e.message)
	}
}

export const getSettings = () => {
	try {
		const data = readFileSync(path.resolve('../../data/settings.json'))
		const constants = JSON.parse(data)
		log('readed settings', constants)

		return constants
	} catch (e) {
		log(e.message)
	}
}