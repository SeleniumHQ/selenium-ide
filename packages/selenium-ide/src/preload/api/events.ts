import { ipcRenderer } from 'electron'
import processAPI from '../../common/processAPI'

type Listener = (...args: any[]) => any
export default processAPI('events', ({ path }) => {
  const listeners: Listener[] = []
  const eventAPI = {
    addListener: (listener: Listener): void => {
      listeners.push(listener)
    },
    dispatchEvent: (...args: any[]): void => {
      listeners.forEach(fn => fn(...args))
    },
    removeListener: (listener: Listener): void => {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    },
  }
  ipcRenderer.on(path, async (_event, ...args) => {
    console.debug(`Received event ${path} with args`, ...args)
    eventAPI.dispatchEvent(...args)
    ipcRenderer.send(`${path}.received`)
  })
  return eventAPI
})
