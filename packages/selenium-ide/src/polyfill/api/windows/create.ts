import { BrowserWindow } from 'electron'
import browserHandler from 'browser/polyfill/classes/Handler'
import rendererPath from 'main/constants/rendererPath'
import preloadPath from 'main/constants/preloadScriptPath'
import mainHandler from 'main/polyfill/classes/Handler'
import { WindowData } from 'polyfill/types'
import WindowEntry from 'main/session/classes/windows/Entry'

export interface CreateWindowOpts {
  url?: string
}

export type Shape = (opts?: CreateWindowOpts) => WindowData

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(
  (_path, session) => (opts) =>
    // We need this fn to be async as well as inside a promise
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve) => {
      const { api, extensions, windows } = session
      // Make the main window
      const window = new BrowserWindow({
        width: 1460,
        height: 840,
        webPreferences: {
          nodeIntegration: false,
          preload: preloadPath,
        },
      })
      window.loadFile(rendererPath)
      // Just a bit of focus passing
      // Add extensions to window
      const builtExtensions = []
      for (let i = 0, ii = extensions.length; i !== ii; i++) {
        builtExtensions.push(
          await window.webContents.session.loadExtension(extensions[i])
        )
      }

      // Wire up events
      const entry = new WindowEntry(session, window)
      windows.create(entry)
      window.webContents.once('dom-ready', async () => {
        const windowData = entry.data
        api.windows.onCreated.dispatchEvent(windowData)

        // Handle url param
        if (opts?.url) {
          await api.tabs.create(null, {
            active: true,
            url: opts.url,
            windowId: entry.window.id,
          })
        }
        resolve(windowData)
      })
    })
)
