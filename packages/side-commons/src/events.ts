import { EventEmitterKey, EventEmitterLike, Fn } from "./types"

export function mergeEventEmitter(target: any, emitter: EventEmitterLike): void {
  const whiteList: EventEmitterKey[] = [
    'addListener',
    'removeListener',
    'listenerCount',
    'on',
    'off',
    'once',
    'prependListener',
    'prependOnceListener',
  ]
  whiteList.forEach(emitterProperty => {
    target[emitterProperty] = emitter[emitterProperty]
      ? (emitter[emitterProperty] as Fn).bind(emitter)
      : undefined
  })
}
