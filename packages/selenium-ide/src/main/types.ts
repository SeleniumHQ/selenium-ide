import { App, Menu } from 'electron'
import Store from 'electron-store'
import config from './store/config'
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
import { StorageSchema } from './store'

export type Config = typeof config

export type Storage = Store<StorageSchema>

export interface Session {
  api: MainApiMapper
  app: App
  argTypes: ArgTypesController
  commands: CommandsController
  dialogs: DialogsController
  driver: DriverController
  menu: Menu
  playback: PlaybackController
  plugins: PluginsController
  projects: ProjectsController
  recorder: RecorderController
  state: StateController
  store: Storage
  suites: SuitesController
  tests: TestsController
  variables: VariablesController
  windows: WindowsController
}

export type SessionControllerKeys = keyof Omit<Session, 'app' | 'api'>

export type SessionApiHandler = (
  path: string,
  session: Session
) => (...args: any[]) => any
