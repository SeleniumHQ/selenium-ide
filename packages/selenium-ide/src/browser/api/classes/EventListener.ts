import { ipcRenderer } from 'electron'
import { BaseListener, VariadicArgs } from '@seleniumhq/side-api'

const isDefined = <T>(value: T | undefined): value is T => {
  return value !== undefined
}

const baseListener = <ARGS extends VariadicArgs>(
  path: string
): BaseListener<ARGS> & { emitEvent: (...args: ARGS) => void } => {
  const listeners: any[] = []
  return {
    addListener(listener) {
      console.debug(path, 'listener added')
      ipcRenderer.send(`${path}.addListener`)
      listeners.push(listener)
    },
    async dispatchEvent(...args) {
      console.debug(path, 'dispatching event')
      const results = await Promise.all(listeners.map((fn) => fn(...args)))
      ipcRenderer.send(`${path}.response`, results.filter(isDefined))
      return results
    },
    emitEvent(...args) {
      console.debug(path, 'emitting event')
      ipcRenderer.send(`${path}.emit`, ...args)
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
  const handler = (_event: Electron.IpcRendererEvent, ...args: any[]) =>
    api.dispatchEvent(...(args as ARGS))

  ipcRenderer.addListener(path, handler)
  window.addEventListener('beforeunload', () => {
    ipcRenderer.removeListener(path, handler)
  })
  return api
}

const EventListener =
  <ARGS extends VariadicArgs>() =>
  (path: string) =>
    wrappedListener<ARGS>(path)

export default EventListener
