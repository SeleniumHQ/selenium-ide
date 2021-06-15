import { ipcMain } from 'electron'
import { DirectApiMapper } from '../../types'
import { Session } from '../../types/server'
import eventsAPI from '../../api/events'
import processAPI from '../../common/processAPI'

export default (session: Session) =>
  processAPI<typeof eventsAPI, DirectApiMapper<typeof eventsAPI>>(
    eventsAPI,
    (path, handler) => {
      const formatter = handler(session)
      const listeners: Electron.WebContents[] = []
      ipcMain.on(`${path}.addListener`, event => {
        if (!listeners.includes(event.sender)) {
          listeners.push(event.sender)
        }
      })
      ipcMain.on(`${path}.removeListener`, event => {
        const index = listeners.indexOf(event.sender)
        if (index !== -1) {
          listeners.splice(index, 1)
        }
      })
      return (...args: any[]) => {
        const formattedArgs = formatter(...args)
        console.debug('Broadcasting', path, 'with', ...formattedArgs)
        listeners.forEach(webContents =>
          webContents.send(path, ...formattedArgs)
        )
      }
    }
  )
