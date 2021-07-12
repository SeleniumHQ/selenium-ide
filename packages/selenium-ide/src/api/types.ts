import { LoadedWindow } from 'browser/types'
import { Session } from 'main/types'

export type VariadicArgs = any[]

export type ApiHandler = (...args: any[]) => any

export type ApiPromiseHandler = (...args: any[]) => PromiseLike<any>

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
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
export interface CommandShape {
  id: string
  comment: string
  command: string
  target: string
  targets: [string, string][]
  value: string
}

export interface TestShape {
  id: string
  name: string
  commands: CommandShape[]
}

export interface SuiteShape {
  id: string
  name: string
  persistSession: boolean
  parallel: boolean
  timeout: number
  tests: string[]
}

export interface SnapshotTestShape {
  id: string
  snapshot: {
    commands: { [key: string]: '\n' }
    setupHooks: []
    teardownHooks: []
  }
}

export interface SnapshotsShape {
  tests: SnapshotTestShape[]
  dependencies: { [key: string]: string }
  jest: {
    extraGlobals: string[]
  }
}

export interface ProjectShape {
  id: string
  version: '2.0' | '3.0'
  name: string
  url: string
  urls: string[]
  plugins: any[]
  tests: TestShape[]
  suites: SuiteShape[]
  snapshot: SnapshotsShape
}
