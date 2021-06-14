import { ipcMain } from 'electron'
import { ApiShape, Session } from '../../types'
import processAPI from '../../common/processAPI'

export default (session: Session): ApiShape =>
  processAPI('events', ({ load, path }) => {
    const formatter = load()(session)
    return (...args: any[]) =>
      new Promise(resolve => {
        ipcMain.once(`${path}.received`, (_event, ...args2) => {
          resolve(args2)
        })
        const formattedArgs = formatter(...args)
        console.debug('Broadcasting', path, 'with', ...formattedArgs)
        session.extensionView.webContents.send(path, ...formattedArgs)
      })
  })
