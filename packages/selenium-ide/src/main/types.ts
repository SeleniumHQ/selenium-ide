import { App, Menu } from 'electron'
import config from './config'
import ArgTypesController from './session/controllers/ArgTypes'
import CommandsController from './session/controllers/Commands'
import DialogsController from './session/controllers/Dialogs'
import DriverController from './session/controllers/Driver'
import PlaybackController from './session/controllers/Playback'
import PluginsController from './session/controllers/Plugins'
import ProjectsController from './session/controllers/Projects'
import RecorderController from './session/controllers/Recorder'
import StateController from './session/controllers/State'
import SuitesController from './session/controllers/Suites'
import TestsController from './session/controllers/Tests'
import VariablesController from './session/controllers/Variables'
import WindowsController from './session/controllers/Windows'
import { MainApiMapper } from './api'

export type Config = typeof config

export interface Session {
  api: MainApiMapper
  app: App
  argTypes: ArgTypesController
  commands: CommandsController
  config: Config
  dialogs: DialogsController
  driver: DriverController
  menu: Menu
  playback: PlaybackController
  plugins: PluginsController
  projects: ProjectsController
  recorder: RecorderController
  state: StateController
  suites: SuitesController
  tests: TestsController
  variables: VariablesController
  windows: WindowsController
}

export type SessionApiHandler = (
  path: string,
  session: Session
) => (...args: any[]) => any
