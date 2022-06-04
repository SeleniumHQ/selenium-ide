import { BaseApi } from './types'
import { commands as dialogs, Shape as Dialogs } from './commands/dialogs'
import { commands as driver, Shape as Driver } from './commands/driver'
import { commands as menus, Shape as Menus } from './commands/menus'
import { commands as playback, Shape as Playback } from './commands/playback'
import { commands as plugins, Shape as Plugins } from './commands/plugins'
import { commands as projects, Shape as Projects } from './commands/projects'
import { commands as recorder, Shape as Recorder } from './commands/recorder'
import { commands as state, Shape as State } from './commands/state'
import { commands as suites, Shape as Suites } from './commands/suites'
import { commands as system, Shape as System } from './commands/system'
import { commands as tests, Shape as Tests } from './commands/tests'
import { commands as windows, Shape as Windows } from './commands/windows'

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
