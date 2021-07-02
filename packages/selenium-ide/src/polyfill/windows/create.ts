import { BrowserWindow } from 'electron'
import Handler from 'browser/helpers/Handler'
import rendererPath from 'main/constants/rendererPath'
import preloadPath from 'main/constants/preloadScriptPath'
import { Session } from 'main/types'
import { WindowData } from '../types'

export interface CreateWindowOpts {
  url?: string
}

export const browser = Handler<[CreateWindowOpts], [WindowData]>()

export const main =
  (_path: string, session: Session) => (opts?: CreateWindowOpts) =>
    new Promise(async (resolve) => {
      const { api, extensions, windows } = session
      // Make the main window
      const window = new BrowserWindow({
        width: 1460,
        height: 840,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          preload: preloadPath,
        },
      })
      window.loadFile(rendererPath)
      // Just a bit of focus passing
      window.on('ready-to-show', () => {
        window.show()
        window.focus()
      })
      // Add extensions to window
      const builtExtensions = []
      for (let i = 0, ii = extensions.length; i !== ii; i++) {
        builtExtensions.push(
          await window.webContents.session.loadExtension(extensions[i])
        )
      }

      // Wire up events
      const entry = windows.create(window)
      window.on('closed', () => api.windows.onRemoved(windows.getData(entry)))
      window.on('focus', () =>
        api.windows.onFocusChanged(windows.getData(entry))
      )
      window.webContents.once('dom-ready', async () => {
        api.windows.onCreated(windows.getData(entry))

        // Handle url param
        if (opts?.url) {
          await api.tabs.create({
            active: true,
            url: opts.url,
            windowId: entry.window.id,
          })
        }
        resolve(session.windows.getData(entry))
      })
    })
