import { ipcMain, WebContents } from 'electron'
import { BaseListener, EventMutator, ListenerFn, VariadicArgs } from '@seleniumhq/side-api'
import { Session } from 'main/types'
import getCore from '../helpers/getCore'
import { COLOR_CYAN, vdebuglog } from 'main/util'

const apiDebugLog = vdebuglog('api', COLOR_CYAN)

const baseListener = <ARGS extends VariadicArgs>(
  path: string,
  session: Session,
  mutator?: EventMutator<ARGS>
): BaseListener<ARGS> => {
  const listeners: any[] = []
  return {
    addListener(listener) {
      apiDebugLog('Listener added', path)
      listeners.push(listener)
    },
    async dispatchEvent(...args) {
      apiDebugLog('Dispatch event', path, args)
      if (mutator) {
        const newState = mutator(getCore(session), args)
        session.projects.project = newState.project
        session.state.state = newState.state
        session.api.state.onMutate.dispatchEvent(path, args)
      }
      const results = await Promise.all(listeners.map((fn) => fn(...args)))
      return results;
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
      apiDebugLog('Listener removed', path)
      listeners.splice(index, 1)
    },
  }
}

const wrappedListener = <ARGS extends VariadicArgs>(
  path: string,
  session: Session,
  mutator?: EventMutator<ARGS>
) => {
  const api = baseListener<ARGS>(path, session, mutator)
  const senders: WebContents[] = []
  const senderCounts: number[] = []
  const senderFns: ListenerFn<ARGS>[] = []

  const removeListener = ({ sender }: Electron.IpcMainEvent) => {
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
  }
  ipcMain.on(`${path}.removeListener`, removeListener)

  const addListener = (event: Electron.IpcMainEvent) => {
    const { sender } = event
    const index = senders.indexOf(sender)
    if (index !== -1) {
      senderCounts[index] += 1
      return
    }
    const senderFn = async (...args: ARGS) => {
      try {
        sender.send(path, ...args)
      } catch (e) {
        // Sender has expired
        removeListener(event)
      }
    }
    api.addListener(senderFn)
    senders.push(sender)
    senderCounts.push(1)
    senderFns.push(senderFn)
  }
  ipcMain.on(`${path}.addListener`, addListener)

  ipcMain.on(path, (_event, ...args) => {
    api.dispatchEvent(...(args as ARGS))
  })
  return api
}

interface EventListenerConfig {}

const EventListener =
  <ARGS extends VariadicArgs>(_config?: EventListenerConfig) =>
  (path: string, session: Session, mutator?: EventMutator<ARGS>) =>
    wrappedListener<ARGS>(path, session, mutator)

export default EventListener
