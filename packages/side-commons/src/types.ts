export type Fn = (...args: any[]) => any
export interface EventEmitterLike {
  addListener?: Fn
  removeListener?: Fn
  listenerCount?: Fn
  on?: Fn
  off?: Fn
  once?: Fn
  prependListener?: Fn
  prependOnceListener?: Fn
}
export type EventEmitterKey = keyof EventEmitterLike
