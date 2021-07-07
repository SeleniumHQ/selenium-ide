import { LoadedWindow } from 'browser/types'
import { Session } from 'main/types'

export type VariadicArgs = any[]

export type ApiHandler = (...args: any[]) => any

export type ApiArrayHandler = (...args: any[]) => any[]
export interface PolyfillEntry {
  browser: (path: string, context: LoadedWindow) => any
  main: (path: string, context: Session) => any
}

export interface PolyfillNamespace {
  [key: string]: PolyfillEntry
}

export interface BasePolyfill {
  [key: string]: PolyfillNamespace
}

export type PolyfillHandler = (path: string, handler: PolyfillEntry) => any

export type GenericPolyfillNamespace = {
  [key: string]: any
}

export type GenericPolyfill = {
  [key: string]: GenericPolyfillNamespace
}

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
