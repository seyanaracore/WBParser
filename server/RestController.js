import * as feathersjs from '@feathersjs/errors'

export default class RestController {
  repository = null

  constructor(repository) {
    this.repository = repository
  }

  async find({ query }) {
    if (query.restore) {
      await this.repository.restore()

      return this.repository.get()
    }

    return this.repository.get()
  }

  async create(data) {
    console.log(typeof data)
    return this.repository.set(data)
  }
}
