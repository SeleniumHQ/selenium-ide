import { BrowserView } from 'electron'
import curryN from 'lodash/fp/curryN'
import { ApiHandler, Config } from '../../../types'
import tabs from '../TabManager'

/**
 * This code isn't used, but I kept it around
 * because this represents the right way that the client
 * requests elevated permission actions from Electron
 */

interface AddTabOptions {
  locked: boolean
}

export default curryN(
  3,
  async (
    { api, window }: Config,
    path: string,
    title: string,
    options: AddTabOptions
  ) => {
    const controllerView = new BrowserView()
    window.addBrowserView(controllerView)
    controllerView.webContents.loadURL(path)
    controllerView.webContents.openDevTools()
    const tabID = tabs.add(controllerView)
    await api.client.tabs.add(tabID, title, options)
    await api.server.tabs.select(tabID)
  }
) as ApiHandler
