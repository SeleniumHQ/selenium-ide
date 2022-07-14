import { CommandShape } from '@seleniumhq/side-model'
import { CommandTypes } from '@seleniumhq/side-model/dist/Commands'
import { badIndex } from '../../constants/badIndex'
import { loadingID } from '../../constants/loadingID'
import { CommandsStateShape } from './command'

/**
 * State data is the data from the active IDE sessio that will not be persisted.
 * Playback state, breakpoints, status, whatever is from within a session
 */

export interface EditorStateShape {
  copiedCommands: Omit<CommandShape, 'id'>[]
  selectedCommandIndexes: number[]
  selectedTestIndexes: number[]
  suiteMode: 'viewer' | 'editor'
}

export const defaultEditorState: EditorStateShape = {
  copiedCommands: [],
  selectedCommandIndexes: [],
  selectedTestIndexes: [],
  suiteMode: 'viewer',
}

export interface RecorderStateShape {
  activeFrame: string
}

export const defaultRecorderState: RecorderStateShape = {
  activeFrame: 'root',
}

export type InsertCommandPref = 'Before' | 'After'
export type ThemePref = 'Dark' | 'Light' | 'System'
export type CamelCaseNamesPref = 'Yes' | 'No'
export type IgnoreCertificateErrorsPref = 'Yes' | 'No'

export interface UserPrefs {
  insertCommandPref: InsertCommandPref
  themePref: ThemePref
  camelCaseNamesPref: CamelCaseNamesPref
  ignoreCertificateErrorsPref: IgnoreCertificateErrorsPref
}

export const defaultUserPrefs: UserPrefs = {
  insertCommandPref: 'After',
  themePref: 'System',
  camelCaseNamesPref: 'No',
  ignoreCertificateErrorsPref: 'No',
}

export interface PlaybackStateShape {
  commands: CommandsStateShape
  currentIndex: number
  currentTestIndex: number
  stopIndex: number
  tests: string[]
  testResults: Record<string, { lastCommand: string }>
}

export const defaultPlaybackState: PlaybackStateShape = {
  commands: {},
  currentIndex: badIndex,
  currentTestIndex: 0,
  stopIndex: badIndex,
  tests: [],
  testResults: {},
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

export const state: StateShape = {
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

export * from './command'
