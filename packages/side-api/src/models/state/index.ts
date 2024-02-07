import { CommandShape } from '@seleniumhq/side-model'
import { CommandTypes } from '@seleniumhq/side-model/dist/Commands'
import { badIndex } from '../../constants/badIndex'
import { loadingID } from '../../constants/loadingID'
import { CommandStateShape, CommandsStateShape } from './command'

/**
 * State data is the data from the active IDE session that will not be persisted.
 * Playback state, breakpoints, status, whatever is from within a session
 */

export interface EditorStateShape {
  configSettingsGroup: ConfigSettingsGroup
  copiedCommands: Omit<CommandShape, 'id'>[]
  overrideWindowSize: {
    active: boolean
    height: number
    width: number
  }
  selectedCommandIndexes: number[]
  selectedTestIndexes: number[]
  showDrawer: boolean
  suiteMode: 'viewer' | 'editor'
}

export const defaultEditorState: EditorStateShape = {
  configSettingsGroup: 'project',
  copiedCommands: [],
  overrideWindowSize: {
    active: false,
    height: 600,
    width: 800,
  },
  selectedCommandIndexes: [],
  selectedTestIndexes: [],
  showDrawer: true,
  suiteMode: 'editor',
}

export interface RecorderStateShape {
  activeFrame: string
}

export const defaultRecorderState: RecorderStateShape = {
  activeFrame: 'root',
}

export type ConfigSettingsGroup = 'project' | 'system'
export type VerboseBoolean = 'Yes' | 'No'
export type InsertCommandPref = 'Before' | 'After'
export type ThemePref = 'Dark' | 'Light' | 'System'
export type CamelCaseNamesPref = VerboseBoolean
export type IgnoreCertificateErrorsPref = VerboseBoolean

export interface UserPrefs {
  disableCodeExportCompat: VerboseBoolean
  insertCommandPref: InsertCommandPref
  themePref: ThemePref
  camelCaseNamesPref: CamelCaseNamesPref
  ignoreCertificateErrorsPref: IgnoreCertificateErrorsPref
}

export const defaultUserPrefs: UserPrefs = {
  disableCodeExportCompat: 'No',
  insertCommandPref: 'After',
  themePref: 'System',
  camelCaseNamesPref: 'No',
  ignoreCertificateErrorsPref: 'No',
}

export type TestResultShape = Pick<
  CommandStateShape,
  'error' | 'message' | 'state'
> & {
  lastCommand: CommandShape | null
}

export interface PlaybackStateShape {
  commands: CommandsStateShape
  currentIndex: number
  currentTestIndex: number
  stopIndex: number
  tests: string[]
  testResults: Record<string, TestResultShape>
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
  locators: string[]
  logs: string[]
  logPath: string
  playback: PlaybackStateShape
  recorder: RecorderStateShape
  status: 'idle' | 'paused' | 'playing' | 'recording'
  userPrefs: UserPrefs
}

export const state: StateShape = {
  activeSuiteID: loadingID,
  activeTestID: loadingID,
  breakpoints: [],
  commands: {},
  editor: defaultEditorState,
  locators: [
    'css:data-test-id',
    'id',
    'linkText',
    'name',
    'css:data-attr',
    'css:finder',
    'xpath:link',
    'xpath:img',
    'xpath:attributes',
    'xpath:idRelative',
    'xpath:href',
    'xpath:position',
    'xpath:innerText',
  ],
  logs: [],
  logPath: '',
  playback: defaultPlaybackState,
  recorder: defaultRecorderState,
  status: 'idle',
  userPrefs: defaultUserPrefs,
}

export * from './command'
