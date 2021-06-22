import { ipcRenderer } from 'electron'
import eventsAPI from '../../api/events'
import processAPI from '../../common/processAPI'
import { ApiHandler, EventReturnApiMapper } from '../../types'

export default processAPI<
  typeof eventsAPI,
  EventReturnApiMapper<typeof eventsAPI>
>(eventsAPI, path => {
  const listeners: ApiHandler[] = []
  const eventModule = {
    // Tell the server to start talking if 1st listener
    addListener: (listener: ApiHandler): void => {
      if (!listeners.length) {
        ipcRenderer.send(`${path}.addListener`)
      }
      console.debug('Adding', path, 'listener', listener, 'to', listeners)
      listeners.push(listener)
    },
    dispatchEvent: (...args: any[]): void => {
      console.debug('Dispatching', path, 'event with args', ...args)
      Object.values(listeners).forEach(fn => fn(...args))
    },
    // Tell the server to stop talking if last listener
    removeListener: (listener: ApiHandler): void => {
      console.debug(
        'Removing',
        listener,
        'from',
        listeners,
        listeners[0] === listener
      )
      const index = listeners.indexOf(listener)
      if (index === -1) {
        throw new Error(`Unable to remove listener for ${path}`)
      }
      listeners.splice(index, 1)
      if (!listeners.length) {
        ipcRenderer.send(`${path}.removeListener`)
      }
    },
  }
  ipcRenderer.on(path, async (_event, ...args) => {
    console.debug(`Received event ${path} with args`, ...args)
    eventModule.dispatchEvent(...args)
    ipcRenderer.send(`${path}.received`)
  })
  return eventModule
})
