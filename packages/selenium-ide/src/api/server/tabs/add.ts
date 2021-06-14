import { BrowserView } from 'electron'
import curryN from 'lodash/fp/curryN'
import { ApiHandler, Session, TabShim } from '../../../types'
import preloadScriptPath from '../../../constants/preloadScriptPath'

export interface AddTabOptions {
  isSelenium?: boolean
}

export default curryN(
  3,
  async (
    { api, config, extension, tabManager, window }: Session,
    url: string,
    title: string
  ): Promise<TabShim> => {
    const isSelenium = url.startsWith(extension.url)
    console.log(extension.url)
    const browserViewOptions = isSelenium
      ? { webPreferences: { preload: preloadScriptPath } }
      : {}
    const browserView = new BrowserView(browserViewOptions)
    window.addBrowserView(browserView)
    browserView.webContents.loadURL(url)
    if (config.activateDebuggerInBrowserview) {
      browserView.webContents.openDevTools()
    }
    const tabID = tabManager.add(browserView)
    const tabShim = tabManager.getShim(tabID, { title, url })
    await api.client.tabs.add(tabShim, { isSelenium })
    await api.server.tabs.select(tabShim.id)
    await api.events.tabs.onUpdated(tabShim)
    return tabShim
  }
) as ApiHandler
