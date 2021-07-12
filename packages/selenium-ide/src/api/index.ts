import { BaseApi } from './types'
import * as dialogs from './commands/dialogs'
import * as playback from './commands/playback'
import * as plugins from './commands/plugins'
import * as projects from './commands/projects'
import * as suites from './commands/suites'
import * as tests from './commands/tests'
import * as variables from './commands/variables'

export interface Api extends BaseApi {
  dialogs: typeof dialogs
  playback: typeof playback
  plugins: typeof plugins
  projects: typeof projects
  suites: typeof suites
  tests: typeof tests
  variables: typeof variables
}

const api: Api = {
  dialogs,
  playback,
  plugins,
  projects,
  suites,
  tests,
  variables,
}

export default api
