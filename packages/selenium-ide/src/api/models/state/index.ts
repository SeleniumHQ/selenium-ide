import { CommandShape } from '@seleniumhq/side-model'
import { CommandTypes } from '@seleniumhq/side-model/dist/Commands'
import badIndex from 'api/constants/badIndex'
import loadingID from 'api/constants/loadingID'
import { UserPrefs } from 'api/types'
import { CommandsStateShape } from './command'

/**
 * State data is the data from the active IDE sessio that will not be persisted, except for userPrefs until that is refactored
 * Playback state, breakpoints, status, whatever is from within a session
 */

export interface EditorStateShape {
  copiedCommands: Omit<CommandShape, 'id'>[]
  selectedCommandIndexes: number[]
  selectedTestIndexes: number[]
}

export const defaultEditorState: EditorStateShape = {
  copiedCommands: [],
  selectedCommandIndexes: [],
  selectedTestIndexes: [],
}

export interface RecorderStateShape {
  activeFrame: string
}

export const defaultRecorderState: RecorderStateShape = {
  activeFrame: 'root',
}

export const defaultUserPrefs: UserPrefs = {
  themePref: 'System',
  insertCommandPref: 'After',
}

export interface PlaybackStateShape {
  commands: CommandsStateShape
  currentIndex: number
  currentTestIndex: number
  stopIndex: number
  tests: string[]
}

export const defaultPlaybackState: PlaybackStateShape = {
  commands: {},
  currentIndex: badIndex,
  currentTestIndex: 0,
  stopIndex: badIndex,
  tests: [],
}

export interface StateShape {
  activeSuiteID: string
  activeTestID: string
  breakpoints: string[]
  commands: CommandTypes
  editor: EditorStateShape
  userPrefs: UserPrefs
  logs: string[]
  playback: PlaybackStateShape
  recorder: RecorderStateShape
  status: 'idle' | 'paused' | 'playing' | 'recording'
}

export type Shape = StateShape

const action: StateShape = {
  activeSuiteID: loadingID,
  activeTestID: loadingID,
  breakpoints: [],
  commands: {},
  editor: defaultEditorState,
  userPrefs: defaultUserPrefs,
  logs: [],
  playback: defaultPlaybackState,
  recorder: defaultRecorderState,
  status: 'idle',
}

export default action