import api from '.'
import { ApiShape } from '../types'
import { ipcMain } from 'electron'

interface WindowWrapper {
  window: Electron.BrowserWindow
}

export default ({ window }: WindowWrapper): ApiShape =>
  Object.entries(api).reduce(
    (acc, [namespace, mapping]) => ({
      ...acc,
      [namespace]: Object.entries(mapping).reduce(
        (acc2, [command]) => ({
          ...acc2,
          [command]: (...args: any[]) =>
            new Promise(resolve => {
              ipcMain.once(
                `${namespace}.${command}.complete`,
                (_event, ...args2) => {
                  resolve(args2)
                }
              )
              window.webContents.send(`${namespace}.${command}`, ...args)
            }),
        }),
        {}
      ),
    }),
    {}
  )
