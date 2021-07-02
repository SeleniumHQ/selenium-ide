import { App } from 'electron'
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
  config: Config
  windows: WindowManager
}
