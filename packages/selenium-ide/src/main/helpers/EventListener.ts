import { ipcMain, WebContents } from 'electron'
import get from 'lodash/fp/get'
import { VariadicArgs } from 'polyfill/types'
import { Session } from '../types'

export type ListenerFn<ARGS extends VariadicArgs> = (...args: ARGS) => void
export interface BaseListener<ARGS extends VariadicArgs> {
  addListener: (listener: ListenerFn<ARGS>) => void
  hasListener: (listener: ListenerFn<ARGS>) => boolean
  dispatchEvent: ListenerFn<ARGS>
  listeners: ListenerFn<ARGS>[]
  removeListener: (listener: ListenerFn<ARGS>) => void
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
    dispatchEvent(...args) {
      listeners.forEach((fn) => fn(...args))
    },
    hasListener(listener) {
      return listeners.includes(listener)
    },
    listeners,
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
  const senders: WebContents[] = []
  const senderCounts: number[] = []
  const senderFns: ListenerFn<ARGS>[] = []

  ipcMain.on(`${path}.addListener`, ({ sender }) => {
    const index = senders.indexOf(sender)
    if (index !== -1) {
      senderCounts[index] += 1
      return
    }
    senders.push(sender)
    senderCounts.push(1)
    const senderFn = (...args: ARGS) => {
      sender.send(path, ...args)
    }
    senderFns.push(senderFn)
    api.addListener(senderFn)
  })

  ipcMain.on(`${path}.removeListener`, ({ sender }) => {
    const index = senders.indexOf(sender)
    if (index !== -1) {
      senderCounts[index] -= 1
      if (senderCounts[index] === 0) {
        senders.splice(index, 1)
        senderCounts.splice(index, 1)
        const [senderFn] = senderFns.splice(index, 1)
        api.removeListener(senderFn)
      }
      return
    }
  })

  ipcMain.on(path, (_event, ...args) => {
    api.dispatchEvent(...(args as ARGS))
  })
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
