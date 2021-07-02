import { LoadedWindow } from 'browser/types'
import { Session } from 'main/types'

export type VariadicArgs = any[]

export type ApiHandler = (...args: any) => any

export interface PolyfillEntry {
  browser: (name: string, context: LoadedWindow) => any
  main?: (name: string, context: Session) => any
}

export interface PolyfillResult {
  [key: string]: {
    [key: string]: any
  }
}

export interface PolyfillNamespace {
  [key: string]: PolyfillEntry
}

export interface BasePolyfill {
  [key: string]: PolyfillNamespace
}

export type PolyfillHandler = (name: string, entry: PolyfillEntry) => any

export interface TabData {
  active: boolean
  id: number
  status: string
  title: string
  url: string
  windowId: number
  [key: string]: boolean | number | string
}

export interface WindowData {
  focused: boolean
  id: number
  tabs: TabData[]
  [key: string]: boolean | number | TabData[]
}
