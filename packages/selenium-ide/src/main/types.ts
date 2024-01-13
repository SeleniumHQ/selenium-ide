import { Chrome } from '@seleniumhq/browser-info'
import { Browser } from '@seleniumhq/get-driver'
import { App } from 'electron'
import Store from 'electron-store'
import config from './store/config'
import ArgTypesController from './session/controllers/ArgTypes'
import ChannelsController from './session/controllers/Channels'
import CommandsController from './session/controllers/Commands'
import DialogsController from './session/controllers/Dialogs'
import DriverController from './session/controllers/Driver'
import MenuController from './session/controllers/Menu'
import OutputFormatsController from './session/controllers/OutputFormats'
import PlaybackController from './session/controllers/Playback'
import PluginsController from './session/controllers/Plugins'
import PolyfillController from './session/controllers/Polyfill'
import ProjectsController from './session/controllers/Projects'
import RecorderController from './session/controllers/Recorder'
import ResizablePanelsController from './session/controllers/ResizablePanels'
import StateController from './session/controllers/State'
import SuitesController from './session/controllers/Suites'
import SystemController from './session/controllers/System'
import TestsController from './session/controllers/Tests'
import WindowsController from './session/controllers/Windows'
import { MainApi } from './api'
import { StorageSchema } from './store'

export interface BrowserInfo extends Pick<Chrome.BrowserInfo, 'version'> {
  binary?: Chrome.BrowserInfo['binary']
  browser: Browser
  useBidi?: boolean
}

export interface BrowsersInfo {
  browsers: BrowserInfo[]
  selected: BrowserInfo | null
}

export type Config = typeof config

export type Storage = Store<StorageSchema>

export interface Session {
  api: MainApi
  app: App
  argTypes: ArgTypesController
  channels: ChannelsController
  commands: CommandsController
  dialogs: DialogsController
  driver: DriverController
  menus: MenuController
  outputFormats: OutputFormatsController
  playback: PlaybackController
  plugins: PluginsController
  projects: ProjectsController
  polyfill: PolyfillController
  recorder: RecorderController
  resizablePanels: ResizablePanelsController
  state: StateController
  store: Storage
  suites: SuitesController
  system: SystemController
  tests: TestsController
  windows: WindowsController
}

export type SessionControllerKeys = keyof Omit<Session, 'app' | 'api'>

export type SessionApiHandler = (
  path: string,
  session: Session
) => (...args: any[]) => any

export type MenuComponent<Args extends any[] = any[]> = (
  session: Session
) => (...args: Args) => Electron.MenuItemConstructorOptions[]

