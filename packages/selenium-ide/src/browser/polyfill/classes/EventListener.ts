import { ipcRenderer } from 'electron'
import { VariadicArgs } from 'polyfill/types'

export interface BaseListener<ARGS extends VariadicArgs> {
  addListener: (listener: (...args: ARGS) => void) => void
  hasListener: (listener: (...args: ARGS) => void) => boolean
  dispatchEvent: (...args: ARGS) => void
  removeListener: (listener: (...args: ARGS) => void) => void
}

const baseListener = <ARGS extends VariadicArgs>(
  path: string
): BaseListener<ARGS> => {
  const listeners: any[] = []
  return {
    addListener(listener) {
      console.debug(path, 'listener added')
      ipcRenderer.send(`${path}.addListener`)
      listeners.push(listener)
    },
    hasListener(listener) {
      return listeners.includes(listener)
    },
    dispatchEvent(...args) {
      console.debug(path, 'dispatching event')
      listeners.forEach((fn) => fn(...args))
    },
    removeListener(listener) {
      const index = listeners.indexOf(listener)
      ipcRenderer.send(`${path}.removeListener`)
      if (index === -1) {
        throw new Error(`Unable to remove listener for ${path} ${listener}`)
      }
      console.debug(path, 'listener removed')
      listeners.splice(index, 1)
    },
  }
}

const wrappedListener = <ARGS extends VariadicArgs>(path: string) => {
  const api = baseListener<ARGS>(path)
  ipcRenderer.on(path, (_event, ...args) =>
    api.dispatchEvent(...(args as ARGS))
  )
  return api
}

const EventListener =
  <ARGS extends VariadicArgs>() =>
  (path: string) =>
    wrappedListener<ARGS>(path)

export default EventListener
