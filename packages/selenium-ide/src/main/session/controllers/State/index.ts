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
import merge from 'lodash/fp/merge'
import BaseController from '../Base'
import { loadingID } from '@seleniumhq/side-api/src/constants/loadingID'

const queue = (op: () => void) => setTimeout(op, 0)

export default class StateController extends BaseController {
  static pathFromID = (id: string) => id.replace(/\-/g, '_')

  state: StateShape = clone(defaultState)

  get(): CoreSessionData {
    return {
      project: this.session.projects.project,
      state: this.state,
    }
  }

  set(key: string, _data: any) {
    if (key.includes('editor.overrideWindowSize')) {
      queue(async () => {
        const { active, height, width } = this.state.editor.overrideWindowSize
        if (active) {
          this.session.windows.resizePlaybackWindows(width, height)
        }
        const panelDims =
          await this.session.resizablePanels.getPlaybackWindowDimensions()
        this.session.windows.resizePlaybackWindows(...panelDims.size)
      })
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
      console.log('Initializing state')
      const storageState: StateShape = this.session.store.get(
        this.getStatePath()
      )
      const newState: StateShape = merge(defaultState, storageState)
      newState.commands = this.state.commands
      newState.editor.selectedCommandIndexes = [0]
      if (!newState.activeTestID || newState.activeTestID === loadingID) {
        newState.activeTestID =
          this.session.projects.project.tests?.[0]?.id ?? loadingID
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
