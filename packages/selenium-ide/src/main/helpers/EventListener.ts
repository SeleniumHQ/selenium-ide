import { ipcMain } from 'electron'
import get from 'lodash/fp/get'
import { VariadicArgs } from 'polyfill/types'
import { Session } from '../types'

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
      listeners.push(listener)
    },
    hasListener(listener) {
      return listeners.includes(listener)
    },
    dispatchEvent(...args) {
      listeners.forEach((fn) => fn(...args))
    },
    removeListener(listener) {
      const index = listeners.indexOf(listener)
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
  ipcMain.on(path, (_event, ...args) => api.dispatchEvent(...(args as ARGS)))
  return api
}

interface EventListenerConfig {}

const EventListener =
  <ARGS extends VariadicArgs>(_config?: EventListenerConfig) =>
  (path: string, session: Session) => {
    const eventBody = get(path, session.api)
    if (eventBody) {
      return wrappedListener<ARGS>(path)
    }
    return baseListener<ARGS>(path)
  }

export default EventListener
