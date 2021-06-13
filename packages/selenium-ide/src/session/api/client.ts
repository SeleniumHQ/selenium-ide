import { ipcMain } from 'electron'
import { ApiShape, Session } from '../../types'
import processAPI from '../../common/processAPI'

export default ({ window }: Session): ApiShape =>
  processAPI('client', ({ path }) => (...args: any[]) =>
    new Promise(resolve => {
      ipcMain.once(`${path}.complete`, (_event, ...args2) => {
        resolve(args2)
      })
      window.webContents.send(path, ...args)
    })
  )
