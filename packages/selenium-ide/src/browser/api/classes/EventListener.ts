import { ipcRenderer } from 'electron'
import { BaseListener, VariadicArgs } from '@seleniumhq/side-api'


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
    dispatchEvent(...args) {
      console.debug(path, 'dispatching event')
      listeners.forEach((fn) => fn(...args))
    },
    hasListener(listener) {
      return listeners.includes(listener)
    },
    listeners,
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
