import { BrowserView } from 'electron'
import { TabData } from '../../../types'
import { Session } from '../../../types/server'
import preloadScriptPath from '../../../constants/preloadScriptPath'

export default (session: Session) => async (url: string): Promise<TabData> => {
  const { api, config, extension, tabs, window } = session
  // Only our approved extension has access to preload scripts, for now
  // This might change for playback scripts and stuff
  const isExtension = url.startsWith(extension.url)
  const browserViewOptions = isExtension
    ? {
        webPreferences: {
          preload: preloadScriptPath,
        },
      }
    : {}
  // Constructing and registering the page
  const browserView = new BrowserView(browserViewOptions)
  window.addBrowserView(browserView)
  const { webContents } = browserView
  webContents.loadURL(url)
  webContents.once('dom-ready', () => {
    api.server.tabs.update(webContents.id, {
      id: webContents.id,
      status: 'complete',
      title: webContents.getTitle(),
    })
  })
  if (config.activateDebuggerInBrowserview) {
    webContents.openDevTools()
  }

  const tab = tabs.create(browserView, url)
  const tabData = tab.data
  // Register the new tab with the front end
  await api.client.tabs.create(tabData, { isExtension })
  // Update the active tab in the server to the new tab
  await api.server.tabs.select(tabData.id)
  return tabData
}
