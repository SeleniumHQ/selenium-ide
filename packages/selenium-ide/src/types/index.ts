export type ApiHandler = (...args: any[]) => any

export interface Config {
  activateDebuggerInBrowserview: boolean
}

export interface TabData {
  active: boolean
  id: number
  status: string
  title: string
  url: string
  windowId: number
}

export type DirectApiMapper<API> = {
  [P in keyof API]: API[P]
}

export type ReturnApiMapper<API> = {
  [P in keyof API]: API[P] extends ApiHandler
    ? ReturnType<API[P]>
    : ReturnApiMapper<API[P]>
}

export type PromiseApiMapper<API> = {
  [P in keyof API]: API[P] extends ApiHandler
    ? (...args: Parameters<API[P]>) => Promise<API[P]>
    : PromiseApiMapper<API[P]>
}

export type ReturnPromiseApiMapper<API> = {
  [P in keyof API]: API[P] extends ApiHandler
    ? (...args: Parameters<API[P]>) => Promise<ReturnType<API[P]>>
    : ReturnPromiseApiMapper<API[P]>
}

export interface EventApiHandler<Handler extends ApiHandler> {
  addListener: (listener: Handler) => void
  dispatchEvents: (...args: Parameters<Handler>) => void
  removeListener: (listener: Handler) => void
}

export type HandlerFromReturnType<Type extends (...args: any) => any[]> = (
  ...args: ReturnType<Type>
) => void

export type EventReturnApiMapper<API> = {
  [P in keyof API]: API[P] extends ApiHandler
    ? EventApiHandler<HandlerFromReturnType<ReturnType<API[P]>>>
    : EventReturnApiMapper<API[P]>
}
