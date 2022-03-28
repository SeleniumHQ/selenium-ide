import clone from 'lodash/fp/clone'
import defaultState from 'api/models/state'
import { CoreSessionData, StateShape } from 'api/types'
import { Session } from 'main/types'
import { getCommandIndex } from 'api/helpers/getActiveData'

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
  async setActiveCommand(commandID: string): Promise<boolean> {
    const session = await this.session.state.get()
    const commandIndex = getCommandIndex(session, commandID)
    this.session.playback.currentStepIndex = commandIndex
    return true
  }
  async setActiveSuite(_suiteID: string): Promise<boolean> {
    return true
  }
  async setActiveTest(_testID: string): Promise<boolean> {
    return true
  }
  async toggleBreakpoint(_stepID: string): Promise<boolean> {
    return true
  }
}
