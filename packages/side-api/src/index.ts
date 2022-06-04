import { BaseApi } from './types'
import * as dialogs from './commands/dialogs'
import * as driver from './commands/driver'
import * as menus from './commands/menus'
import * as playback from './commands/playback'
import * as plugins from './commands/plugins'
import * as projects from './commands/projects'
import * as recorder from './commands/recorder'
import * as state from './commands/state'
import * as suites from './commands/suites'
import * as system from './commands/system'
import * as tests from './commands/tests'
import * as windows from './commands/windows'
export * as models from './models'

export { default as process } from './process'

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
  dialogs: dialogs.Shape
  driver: driver.Shape
  menus: menus.Shape
  playback: playback.Shape
  plugins: plugins.Shape
  projects: projects.Shape
  recorder: recorder.Shape
  state: state.Shape
  suites: suites.Shape
  system: system.Shape
  tests: tests.Shape
  windows: windows.Shape
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

export * from './types'

export default api
