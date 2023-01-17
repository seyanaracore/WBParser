import axios from 'axios'
import {BASE_URL} from "../constants"

class WbParserService {
	static async getSettings() {
		const response = await axios.get(`${BASE_URL}/settings`)

		return response.data
	}
	static async getConstants() {
		const response = await axios.get(`${BASE_URL}/constants`)

		return response.data
	}
	static async setConstants(data) {
		const response = await axios.post(`${BASE_URL}/constants`, data)

		return response.data
	}
	static async setSettings(data) {
		const response = await axios.post(`${BASE_URL}/settings`, data)

		return response.data
	}
	static async restoreConstants(data) {
		const response = await axios.get(`${BASE_URL}/constants`, {params: {restore: true}})

		return response.data
	}
	static async restoreSettings(data) {
		const response = await axios.get(`${BASE_URL}/settings`, {params: {restore: true}})

		return response.data
	}
	static async startParse(data) {
		const response = await axios.post(`${BASE_URL}/startParse`, data)

		return response.data
	}
}

export default WbParserService