import { BaseApi } from './types'
import { commands as dialogs, type Shape as Dialogs } from './commands/dialogs'
import { commands as driver, type Shape as Driver } from './commands/driver'
import { commands as menus, type Shape as Menus } from './commands/menus'
import {
  commands as playback,
  type Shape as Playback,
} from './commands/playback'
import { commands as plugins, type Shape as Plugins } from './commands/plugins'
import {
  commands as projects,
  type Shape as Projects,
} from './commands/projects'
import {
  commands as recorder,
  type Shape as Recorder,
} from './commands/recorder'
import { commands as state, type Shape as State } from './commands/state'
import { commands as suites, type Shape as Suites } from './commands/suites'
import { commands as system, type Shape as System } from './commands/system'
import { commands as tests, type Shape as Tests } from './commands/tests'
import { commands as windows, type Shape as Windows } from './commands/windows'

export interface ApiHoist extends BaseApi {
  dialogs: typeof dialogs
  driver: typeof driver
  menus: typeof menus
  playback: typeof playback
  plugins: typeof plugins
  projects: typeof projects
  recorder: typeof recorder
  state: typeof state
  suites: typeof suites
  system: typeof system
  tests: typeof tests
  windows: typeof windows
}

/**
 * The full API usable by Selenium IDE
 */
export type Api = {
  dialogs: Dialogs
  driver: Driver
  menus: Menus
  playback: Playback
  plugins: Plugins
  projects: Projects
  recorder: Recorder
  state: State
  suites: Suites
  system: System
  tests: Tests
  windows: Windows
}

export type ApiOverrides = {
  [P in keyof Api]?: Partial<Record<keyof Api[P], any>>
}

export const api: ApiHoist = {
  dialogs,
  driver,
  menus,
  playback,
  plugins,
  projects,
  recorder,
  state,
  suites,
  system,
  tests,
  windows,
}

export * from './helpers'
export * from './models'
export * from './process'
export * from './types'
export default api
