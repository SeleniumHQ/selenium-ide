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
  server: ApiShape
}

export interface PersistedCore {
  app: Electron.App
  driver: Driver
}
export interface Session extends PersistedCore {
  api: Api
  app: Electron.App
  driver: Driver
  extension: Electron.Extension
  tabManager: TabManager
  window: Electron.BrowserWindow
}

export type LoadedWindow = Window & typeof globalThis & { seleniumIDE: Api }
