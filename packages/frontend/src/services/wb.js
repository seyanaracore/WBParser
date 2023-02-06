import axios from 'axios'
import { BASE_URL, SOCKET_URL } from '@/constants'
import { io } from 'socket.io-client'

/**
 * @typedef ItemString
 * @type {Object}
 * @property {String} name
 * @property {String} value
 * @property {String} description
 *
 * @typedef ItemNumber
 * @type {Object}
 * @property {String} name
 * @property {Number} value
 * @property {String} description
 *
 * @typedef ItemArray
 * @type {Object}
 * @property {String} name
 * @property {Array} value
 * @property {String} description
 *
 * @typedef Settings
 * @type {Object}
 * @property {ItemString} url
 * @property {ItemString} sorting
 * @property {ItemString} initialIterationPage
 * @property {ItemString} productsCountPerPage
 * @property {ItemString} pagesHandlingCount
 *
 * @typedef Constants
 * @type {Object}
 * @property {ItemString} DEFAULT_DELIMITER
 * @property {ItemString} DEFAULT_ENCODE
 * @property {ItemString} DEFAULT_OUT_PATH
 * @property {ItemString} DEFAULT_TYPE_OUT_FILES
 * @property {ItemNumber} PRODUCTS_PER_PAGE_MAX
 * @property {ItemNumber} PRODUCT_ITERATION_DELAY
 * @property {ItemNumber} MAX_DELAY
 * @property {ItemNumber} DELAY_UPPER
 * @property {ItemArray} SORTING_TYPES
 * @property {ItemString} DEFAULT_LOGS_PATH
 */

class WbParserService {
  /**
   * Получить настройки
   * @returns {Settings} Объект настроек
   */
  static async getSettings() {
    /**
     * @type {axios.AxiosResponse<Settings>}
     */
    const response = await axios.get(`${BASE_URL}/settings`)

    return response.data
  }

  /**
   * Получить настройки
   * @returns {Constants} Объект констант
   */
  static async getConstants() {
    /**
     * @type {axios.AxiosResponse<Constants>}
     */
    const response = await axios.get(`${BASE_URL}/constants`)

    return response.data
  }

  /**
   * Установить константы
   * @param {Constants} constants
   * @returns {Promise<Constants>}
   */
  static async setConstants(constants) {
    const response = await axios.post(`${BASE_URL}/constants`, constants)

    return response.data
  }

  /**
   * Установить настройки
   * @param data
   * @returns {Promise<Settings>}
   */
  static async setSettings(data) {
    /**
     * @type {axios.AxiosResponse<Settings>}
     */
    const response = await axios.post(`${BASE_URL}/settings`, data)

    return response.data
  }

  /**
   * Восстановить константы
   * @returns {Promise<Constants>}
   */
  static async restoreConstants() {
    /**
     * @type {axios.AxiosResponse<Constants>}
     */
    const response = await axios.get(`${BASE_URL}/constants`, { params: { restore: true } })

    return response.data
  }

  /**
   * Восстановить настройки
   * @returns {Promise<Settings>}
   */
  static async restoreSettings() {
    /**
     * @type {axios.AxiosResponse<Settings>}
     */
    const response = await axios.get(`${BASE_URL}/settings`, { params: { restore: true } })

    return response.data
  }

  static async startParse(data = null) {
    const response = await axios.post(`${BASE_URL}/parser`, data)

    return response.data
  }

  static async stopParse() {
    const response = await axios.get(`${BASE_URL}/parser`, { params: { stop: true } })

    return response.data
  }

  static async isParsing() {
    const response = await axios.get(`${BASE_URL}/parser`, { params: { isParsing: true } })

    return response.data
  }

  static async connectLogsSocket() {
    return io(SOCKET_URL, { transports: ['websocket', 'polling'] })
  }
}

export default WbParserService
