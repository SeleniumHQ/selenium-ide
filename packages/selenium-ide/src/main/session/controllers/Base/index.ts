import { Session } from 'main/types'

/**
 * This is the base controller instance, containing our lowest level hooks
 * and identifying the objects downstream as a controller.
 */
export default class BaseController {
  constructor(session: Session) {
    this.session = session
  }
  async onProjectLoaded() {}
  async onProjectUnloaded() {}
  isController = true
  session: Session
}
