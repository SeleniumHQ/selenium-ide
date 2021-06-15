import { ipcRenderer } from 'electron'
import eventsAPI from '../../api/events'
import processAPI from '../../common/processAPI'
import { ApiHandler, EventApiMapper } from '../../types'

export default processAPI<typeof eventsAPI, EventApiMapper<typeof eventsAPI>>(
  eventsAPI,
  path => {
    const listeners: ApiHandler[] = []
    const eventModule = {
      // Tell the server to start talking if 1st listener
      addListener: (listener: ApiHandler): void => {
        if (!listeners.length) {
          ipcRenderer.send(`${path}.addListener`)
        }
        listeners.push(listener)
      },
      dispatchEvent: (...args: any[]): void => {
        console.log(`Dispatching event ${path} with args`, ...args)
        listeners.forEach(fn => fn(...args))
      },
      // Tell the server to stop talking if last listener
      removeListener: (listener: ApiHandler): void => {
        const index = listeners.indexOf(listener)
        if (index === -1) {
          throw new Error(
            `Unable to remove ${path} listener ${listener.toString()}`
          )
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
  }
)
