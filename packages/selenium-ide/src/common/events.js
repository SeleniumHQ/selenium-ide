export function mergeEventEmitter(target, emitter) {
  const whiteList = [
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
      ? emitter[emitterProperty].bind(emitter)
      : undefined
  })
}
