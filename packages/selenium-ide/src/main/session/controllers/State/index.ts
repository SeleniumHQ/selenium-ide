import { getCommandIndex } from 'api/helpers/getActiveData'
import defaultState, { defaultUserPrefs } from 'api/models/state'
import {
  CoreSessionData,
  InsertCommandPref,
  StateShape,
  UserPrefs,
} from 'api/types'
import clone from 'lodash/fp/clone'
import storage from 'main/store'
import BaseController from '../Base'

export default class StateController extends BaseController {
  static pathFromID = (id: string) => id.replace(/\-/g, '_')

  state: StateShape = clone(defaultState)  

  async get(): Promise<CoreSessionData> {
    return {
      project: this.session.projects.project,
      state: this.state,
    }
  }

  getStatePath() {
    const projectID = this.session.projects.project.id
    const projectIDPath = StateController.pathFromID(projectID)
    return `projectStates.${projectIDPath}`
  }

  async onProjectLoaded() {    
    // If this file has been saved, fetch state
    if (this.session.projects.filepath) {
      this.state = {
        ...defaultState,
        ...storage.get(this.getStatePath()),
      }
    }
  }

  async onProjectUnloaded() {
    if (this.session.projects.filepath) {
      // If this file has been loaded or saved, save state
      storage.set(this.getStatePath(), {
        ...this.state,
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

  async toggleUserPrefInsert(insertCommandPref: InsertCommandPref) {
    const userPrefs = await storage.get<'userPrefs'>(
      'userPrefs',
      defaultUserPrefs
    )
    storage.set<'userPrefs'>('userPrefs', { ...userPrefs, insertCommandPref })
  }

  async getUserPref(): Promise<UserPrefs> {
    return storage.get<'userPrefs'>('userPrefs')
  }
}
