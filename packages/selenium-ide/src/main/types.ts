import { App, Menu } from 'electron'
import config from './config'
import DialogsController from './session/controllers/dialogs'
import DriverController from './session/controllers/driver'
import PlaybackController from './session/controllers/Playback'
import PluginsController from './session/controllers/Plugins'
import ProjectsController from './session/controllers/Projects'
import RecorderController from './session/controllers/Recorder'
import SuitesController from './session/controllers/Suites'
import TestsController from './session/controllers/Tests'
import VariablesController from './session/controllers/Variables'
import WindowsController from './session/controllers/Windows'
import { MainApiMapper } from './api'

export type Config = typeof config

export interface Session {
  api: MainApiMapper
  app: App
  menu: Menu
  config: Config
  dialogs: DialogsController
  driver: DriverController
  playback: PlaybackController
  plugins: PluginsController
  projects: ProjectsController
  recorder: RecorderController
  suites: SuitesController
  tests: TestsController
  variables: VariablesController
  windows: WindowsController
}

export type SessionApiHandler = (
  path: string,
  session: Session
) => (...args: any[]) => any
