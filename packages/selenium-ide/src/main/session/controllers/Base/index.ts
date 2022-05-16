import { Session } from 'main/types'

export default class BaseController {
  constructor(session: Session) {
    this.session = session
  }
  async onProjectLoaded() {}
  async onProjectUnloaded() {}
  isController = true
  session: Session
}
