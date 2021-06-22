import { TabManager } from '../session/tabs'
import { Driver } from '../session/driver'
import { ServerApi } from '../session/api'

export interface Config {
  activateDebuggerInBrowserview: boolean
}

export interface PersistedCore {
  app: Electron.App
  driver: Driver
}

export interface Session extends PersistedCore {
  api: ServerApi
  config: Config
  extension: Electron.Extension
  extensionView: Electron.BrowserView
  tabs: TabManager
  window: Electron.BrowserWindow
}
