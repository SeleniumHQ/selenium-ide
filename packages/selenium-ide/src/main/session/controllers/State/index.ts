import { getCommandIndex } from 'api/helpers/getActiveData'
import defaultState from 'api/models/state'
import { CoreSessionData, StateShape } from 'api/types'
import clone from 'lodash/fp/clone'
import storage from 'main/store'
import BaseController from '../Base'

export default class StateController extends BaseController {
  state: StateShape = clone(defaultState)
  async get(): Promise<CoreSessionData> {
    return {
      project: this.session.projects.project,
      state: this.state,
    }
  }

  async onProjectLoaded() {
    // If this file has been saved, fetch state
    if (this.session.projects.filepath) {
      const path = `projectStates.${this.session.projects.project.id}`
      console.log('Getting state', storage.get(path))
      this.state = {
        ...defaultState,
        ...storage.get(path),
        commands: defaultState.commands,
      }
    }
  }

  async onProjectUnloaded() {
    if (this.session.projects.filepath) {
      // If this file has been loaded or saved, save state
      const path = `projectStates.${this.session.projects.project}`
      console.log('Setting state', {
        ...this.state,
        commands: {},
        playback: defaultState.playback,
        recorder: defaultState.recorder,
        status: 'idle',
      })
      storage.set(path, {
        ...this.state,
        commands: {},
        playback: defaultState.playback,
        recorder: defaultState.recorder,
        status: 'idle',
      } as StateShape)
    }
    this.state = clone(defaultState)
  }

  async setActiveCommand(commandID: string): Promise<boolean> {
    const session = await this.session.state.get()
    const commandIndex = commandID ? getCommandIndex(session, commandID) : 0
    this.session.playback.currentStepIndex = commandIndex
    return true
  }
}
