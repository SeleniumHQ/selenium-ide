import { App, Menu } from 'electron'
import config from './config'
import { Driver } from './session/driver'
import storage from './storage'
import { MainApiMapper } from './api'

export type Config = typeof config

export interface PersistedCore {
  app: App
  driver: Driver
}

export interface Session extends PersistedCore {
  api: MainApiMapper
  storage: typeof storage
  menu: Menu
  config: Config
}

export type SessionApiHandler = (
  path: string,
  session: Session
) => (...args: any[]) => any
