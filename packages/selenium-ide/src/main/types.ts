import { App, Menu } from 'electron'
import config from './config'
import { Background } from './session/background'
import { WindowManager } from './session/windows'
import { Driver } from './session/driver'
import { MainPolyfillMapper } from './polyfill'

export type Config = typeof config

export interface PersistedCore {
  app: App
  driver: Driver
}

export interface Session extends PersistedCore {
  api: MainPolyfillMapper
  background: Background
  extensions: string[]
  menu: Menu
  config: Config
  windows: WindowManager
}

export type SessionApiHandler = (
  path: string,
  session: Session
) => (...args: any[]) => any
