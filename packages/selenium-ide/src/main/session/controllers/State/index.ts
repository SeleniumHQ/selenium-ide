import { getCommandIndex } from 'api/helpers/getActiveData'
import defaultState from 'api/models/state'
import { CoreSessionData, StateShape } from 'api/types'
import clone from 'lodash/fp/clone'
import storage from 'main/store'
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

  async onProjectUnloaded() {
    let projectStates = storage.get<'projectStates'>('projectStates')
    if (this.session.projects.filepath) {
      projectStates[this.session.projects.filepath] = this.state
        storage.set<'projectStates'>('projectStates', projectStates)
    }
    this.state = clone(defaultState)
    this.session.system.quit
  }

  async setActiveCommand(commandID: string): Promise<boolean> {
    const session = await this.session.state.get()
    const commandIndex = commandID ?  getCommandIndex(session, commandID) : 0
    this.session.playback.currentStepIndex = commandIndex
    return true
  }
}
