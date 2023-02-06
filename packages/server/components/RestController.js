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
    if (query.stop) {
      return await this.repository.stop()
    }
    if (query.isParsing) {
      return await this.repository.isParsing()
    }

    return this.repository.get()
  }

  async create(data) {
    return this.repository.set(data)
  }
}
