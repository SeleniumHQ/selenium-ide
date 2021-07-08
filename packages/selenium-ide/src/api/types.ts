import { LoadedWindow } from 'browser/types'
import { Session } from 'main/types'

export type VariadicArgs = any[]

export type ApiHandler = (...args: any[]) => any

export type ApiArrayHandler = (...args: any[]) => any[]

export interface ApiEntry {
  browser: (path: string, context: LoadedWindow) => any
  main: (path: string, context: Session) => any
}

export interface ApiNamespace {
  [key: string]: ApiEntry
}

export interface BaseApi {
  [key: string]: ApiNamespace
}

export type GenericApiNamespace = {
  [key: string]: any
}

export type GenericApi = {
  [key: string]: GenericApiNamespace
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
