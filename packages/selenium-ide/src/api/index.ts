import { BaseApi } from './types'
import * as commands from './commands/commands'
import * as dialogs from './commands/dialogs'
import * as driver from './commands/driver'
import * as playback from './commands/playback'
import * as plugins from './commands/plugins'
import * as projects from './commands/projects'
import * as state from './commands/state'
import * as suites from './commands/suites'
import * as tests from './commands/tests'
import * as variables from './commands/variables'
import * as windows from './commands/windows'
export * as models from './models'

export interface Api extends BaseApi {
  commands: typeof commands
  dialogs: typeof dialogs
  driver: typeof driver
  playback: typeof playback
  plugins: typeof plugins
  projects: typeof projects
  state: typeof state
  suites: typeof suites
  tests: typeof tests
  variables: typeof variables
  windows: typeof windows
}

export const api: Api = {
  commands,
  dialogs,
  driver,
  playback,
  plugins,
  projects,
  state,
  suites,
  tests,
  variables,
  windows,
}

export default api
