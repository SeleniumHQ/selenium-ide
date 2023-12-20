import { getCommandIndex } from '@seleniumhq/side-api/dist/helpers/getActiveData'
import { state as defaultState } from '@seleniumhq/side-api'
import {
  CamelCaseNamesPref,
  CoreSessionData,
  defaultUserPrefs,
  IgnoreCertificateErrorsPref,
  InsertCommandPref,
  StateShape,
  ThemePref,
  UserPrefs,
} from '@seleniumhq/side-api'
import clone from 'lodash/fp/clone'
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
      const storageState: StateShape = this.session.store.get(
        this.getStatePath()
      )
      const newState: StateShape = {
        ...defaultState,
        ...storageState,
        commands: this.state.commands,
        editor: {
          ...defaultState.editor,
          ...(storageState?.editor ?? {}),
          selectedCommandIndexes: [],
        },
      }
      this.state = newState
    }
  }

  async onProjectUnloaded() {
    if (this.session.projects.filepath) {
      // If this file has been loaded or saved, save state
      this.session.store.set(this.getStatePath(), {
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

  async toggleUserPrefCamelCase(camelCaseNamesPref: CamelCaseNamesPref) {
    const userPrefs = await this.session.store.get(
      'userPrefs',
      defaultUserPrefs
    )
    this.session.store.set('userPrefs', { ...userPrefs, camelCaseNamesPref })
  }

  async toggleUserPrefTheme(themePref: ThemePref) {
    const userPrefs = await this.session.store.get(
      'userPrefs',
      defaultUserPrefs
    )
    this.session.store.set('userPrefs', { ...userPrefs, themePref })
  }

  async toggleUserPrefInsert(insertCommandPref: InsertCommandPref) {
    const userPrefs = await this.session.store.get(
      'userPrefs',
      defaultUserPrefs
    )
    this.session.store.set('userPrefs', { ...userPrefs, insertCommandPref })
  }

  async toggleUserPrefIgnoreCertificateErrors(
    ignoreCertificateErrorsPref: IgnoreCertificateErrorsPref
  ) {
    const userPrefs = await this.session.store.get(
      'userPrefs',
      defaultUserPrefs
    )
    this.session.store.set('userPrefs', {
      ...userPrefs,
      ignoreCertificateErrorsPref,
    })
  }

  async getUserPrefs(): Promise<UserPrefs> {
    return this.session.store.get('userPrefs', defaultUserPrefs)
  }
}
