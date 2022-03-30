import { ProjectShape } from '@seleniumhq/side-model'
import { Session } from 'main/types'
import { StateShape } from './models/state'

export { StateShape } from './models/state'

export type VariadicArgs = any[]

export type ApiHandler = (...args: any[]) => any
export type EmptyApiHandler = (...args: any[]) => void

export type ApiPromiseHandler = (...args: any[]) => PromiseLike<any>

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
export interface ApiEntry {
  browser: (path: string, context: Window) => any
  main: (path: string, context: Session) => any
  mutator?: (...args: any[]) => any
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

export interface CoreSessionData {
  project: ProjectShape
  state: StateShape
}

export type RequestData<Type extends ApiHandler> = {
  params: Parameters<Type>
  result: Awaited<Promise<ReturnType<Type>>>
}
export type EventMutator<Type extends any> = (
  session: CoreSessionData,
  req: Type
) => CoreSessionData

export type Mutator<Type extends ApiHandler> = (
  session: CoreSessionData,
  req: RequestData<Type>
) => CoreSessionData

export type ListenerFn<ARGS extends VariadicArgs> = (...args: ARGS) => void

export interface BaseListener<ARGS extends VariadicArgs> {
  addListener: (listener: ListenerFn<ARGS>) => void
  hasListener: (listener: ListenerFn<ARGS>) => boolean
  dispatchEvent: ListenerFn<ARGS>
  listeners: ListenerFn<ARGS>[]
  removeListener: (listener: ListenerFn<ARGS>) => void
}

export type EventListenerParams<LISTENER extends BaseListener<any>> =
  Parameters<Parameters<LISTENER['addListener']>[0]>

export type LocatorFields = 'target' | 'value'
