import clone from 'lodash/fp/clone'
import defaultState from 'api/models/state'
import { CoreSessionData, StateShape } from 'api/types'
import { Session } from 'main/types'

export default class StateController {
  constructor(session: Session) {
    this.session = session
    this.state = clone(defaultState)
  }
  session: Session
  state: StateShape
  async get(): Promise<CoreSessionData> {
    return {
      project: this.session.projects.project,
      state: this.state,
    }
  }
  async setActiveCommand(_commandID: string): Promise<boolean> {
    return true
  }
  async setActiveTest(_testID: string): Promise<boolean> {
    return true
  }
  async toggleBreakpoint(_commandID: string): Promise<boolean> {
    return true
  }
}
