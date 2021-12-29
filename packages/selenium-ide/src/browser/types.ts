import { CoreSessionData } from 'api/types'
import { BrowserWindowConstructorOptions, Menu } from 'electron'
import { Session } from 'main/types'
import Api from './api'
import ApiMutators from './api/mutator'

export type FullBrowserAPI = typeof Api & { mutators: typeof ApiMutators }
export type LoadedWindow = Window &
  typeof globalThis & { sideAPI: FullBrowserAPI }

export type CurriedApiField<Config extends any[], Shape> = (
  ...args: Config
) => (name: string, context: Session | LoadedWindow) => Shape

export interface WindowConfig {
  menus?: (menu: Menu) => void
  window: (session: Session) => BrowserWindowConstructorOptions
}

export interface BrowserState extends CoreSessionData {}
