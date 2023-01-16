import * as feathersjs from '@feathersjs/errors'

export default class Respository {
	storage = null
  constructor(storage) {
		this.storage = storage
	}

  async get() {
    return this.storage.data
  }

  async restore() {
    return this.storage.restore()
  }

  async set(config) {
    if (typeof config !== 'object') {
      throw new feathersjs.BadRequest(`awaiting config object`)
    }
    const configObject = {...this.storage.data,...config}

    this.storage.data = configObject

    await this.storage.write()

    return configObject
  }
}
