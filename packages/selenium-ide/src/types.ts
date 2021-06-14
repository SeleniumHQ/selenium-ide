import { Driver } from 'selenium-webdriver/chrome'
import { TabManager } from './session/tabs'

export type ApiHandler = (...args: any[]) => any
export interface ApiNamespaceShape {
  [key: string]: ApiHandler
}

export interface ApiShape {
  [key: string]: ApiNamespaceShape
}

export interface Api {
  client: ApiShape
  events: ApiShape
  server: ApiShape
}

export interface Config {
  activateDebuggerInBrowserview: boolean
}

export interface PersistedCore {
  app: Electron.App
  driver: Driver
}
export interface Session extends PersistedCore {
  api: Api
  app: Electron.App
  config: Config
  driver: Driver
  extension: Electron.Extension
  extensionView: Electron.BrowserView
  tabManager: TabManager
  window: Electron.BrowserWindow
}

export type LoadedWindow = Window & typeof globalThis & { seleniumIDE: Api }

export interface TabDelta {
  active?: boolean
  status?: string
  title?: string
  url?: string
  windowId?: number
}
export interface TabShim {
  active: boolean
  id: number
  status: string
  title: string
  url: string
  windowId: number
}

