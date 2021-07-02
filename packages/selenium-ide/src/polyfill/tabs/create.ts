import { BrowserView } from 'electron'
import Handler from 'browser/helpers/Handler'
import preloadPath from 'main/constants/preloadScriptPath'
import { Session } from 'main/types'
import { TabData } from 'polyfill/types'

export const browser = Handler()

const extensionPreferences = {
  webPreferences: {
    preload: preloadPath,
  },
}

export interface CreateTabOptions {
  active: boolean
  url: string
  windowId: number
}

const getOptions = (
  session: Session,
  urlOrOpts: string | Partial<CreateTabOptions>
): CreateTabOptions => {
  if (typeof urlOrOpts === 'string') {
    return {
      active: true,
      url: urlOrOpts,
      windowId: session.windows.getActive(),
    }
  }
  return {
    active: urlOrOpts.active !== false,
    url: urlOrOpts.url as string,
    windowId: urlOrOpts.windowId || session.windows.getActive(),
  }
}

export const main =
  (_path: string, session: Session) =>
  async (urlOrOpts: string | Partial<CreateTabOptions>): Promise<TabData> => {
    const { active, url, windowId } = getOptions(session, urlOrOpts)
    const { api, windows } = session
    const { tabs, window } = windows.read(windowId)
    // Only our approved extension has access to preload scripts, for now
    // This might change for playback scripts and stuff
    const isExtension = url.startsWith('chrome-extension://')
    // Constructing and registering the page
    const browserView = new BrowserView(isExtension ? extensionPreferences : {})
    window.addBrowserView(browserView)
    const { webContents } = browserView
    webContents.loadURL(url)
    webContents.once('dom-ready', () => {
      api.tabs.update(webContents.id, {
        id: webContents.id,
        status: 'complete',
        title: webContents.getTitle(),
      })
    })

    const tab = tabs.create(browserView, url)
    const tabData = tab.data
    // Update the active tab in the server to the new tab
    if (active !== false) {
      await api.tabs.select(tabData.id)
    }
    return tabData
  }
