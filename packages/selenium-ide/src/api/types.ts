import { ProjectShape } from '@seleniumhq/side-model'
import { Session } from 'main/types'
import { StateShape } from './models/state'

export { StateShape } from './models/state'

export type VariadicArgs = any[]

export type ApiHandler = (...args: any[]) => any

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

// This is shamelessly copied from here:
// https://www.jpwilliams.dev/how-to-unpack-the-return-type-of-a-promise-in-typescript
export type AsyncReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : any
