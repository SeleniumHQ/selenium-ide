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
