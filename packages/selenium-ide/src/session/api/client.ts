import { ipcMain } from 'electron'
import { PromiseApiMapper } from '../../types'
import { Session } from '../../types/server'
import clientAPI from '../../api/client'
import processAPI from '../../common/processAPI'

/* eslint-disable prettier/prettier */
/* eslint-enable prettier/prettier */

export default ({ window }: Session) =>
  processAPI<typeof clientAPI, PromiseApiMapper<typeof clientAPI>>(
    clientAPI,
    path => (...args: any[]): Promise<any> =>
      new Promise(resolve => {
        ipcMain.once(`${path}.complete`, (_event, ...args2) => {
          resolve(args2)
        })
        window.webContents.send(path, ...args)
      })
  )
