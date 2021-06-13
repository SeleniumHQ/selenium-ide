import { BrowserView } from 'electron'
import curryN from 'lodash/fp/curryN'
import { ApiHandler, Session } from '../../../types'
import preloadScriptPath from '../../../constants/preloadScriptPath'

/**
 * This code isn't used, but I kept it around
 * because this represents the right way that the client
 * requests elevated permission actions from Electron
 */

export interface AddTabOptions {
  locked?: boolean
}

export default curryN(
  3,
  async (
    { api, tabManager, window }: Session,
    path: string,
    title: string,
    options: AddTabOptions = {}
  ) => {
    const controllerViewOptions = options.locked
      ? { webPreferences: { preload: preloadScriptPath } }
      : {}
    const controllerView = new BrowserView(controllerViewOptions)
    window.addBrowserView(controllerView)
    controllerView.webContents.loadURL(path)
    controllerView.webContents.openDevTools()
    const tabID = tabManager.add(controllerView)
    await api.client.tabs.add(tabID, title, options)
    await api.server.tabs.select(tabID)
    return controllerView
  }
) as ApiHandler
