import { Session } from 'main/types'

export default class VariablesController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session
  variables: { [key: string]: any } = {}
  async get(name: string) {
    return this.variables[name]
  }
  async getAll() {
    return this.variables
  }
  async set(name: string, value: any) {
    this.variables[name] = value
  }
}
