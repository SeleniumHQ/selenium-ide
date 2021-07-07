import { BrowserView, IpcMainEvent } from 'electron'
import browserHandler from 'browser/polyfill/classes/Handler'
import preloadPath from 'main/constants/preloadScriptPath'
import mainHandlerWithEvent from 'main/polyfill/classes/HandlerWithEvent'
import { Session } from 'main/types'
import { TabData } from 'polyfill/types'
import TabsEntry from 'main/session/classes/tabs/Entry'

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

export type Shape = (
  event: IpcMainEvent | null,
  urlOrOpts: string | Partial<CreateTabOptions>
) => TabData

export const browser = browserHandler<Shape>()

export const main = mainHandlerWithEvent<Shape>(
  (_path, session) => async (event, urlOrOpts) => {
    const { active, url, windowId } = getOptions(session, urlOrOpts)
    const { api, windows } = session
    const windowsEntry = windows.read(windowId)
    const { tabs, window } = windowsEntry
    // Only our approved extension has access to preload scripts, for now
    // This might change for playback scripts and stuff
    const isExtension = url.startsWith('chrome-extension://')
    // Constructing and registering the page
    const browserView = new BrowserView(isExtension ? extensionPreferences : {})
    window.addBrowserView(browserView)
    const { webContents } = browserView
    webContents.loadURL(url)
    webContents.once('dom-ready', () => {
      if (!isExtension) {
        api.webNavigation.onCreatedNavigationTarget.dispatchEvent([
          {
            details: {
              sourceFrameId: 0,
              sourceProcessId: 1,
              sourceTabId: event?.sender?.id ?? 0,
              tabId: webContents.id,
              timeStamp: Date.now(),
              url,
            },
          },
        ])
      }
      api.tabs.update(webContents.id, {
        id: webContents.id,
        status: 'complete',
        title: webContents.getTitle(),
      })
    })

    const tab = tabs.create(new TabsEntry(browserView, windowsEntry))
    const tabData = tab.data
    // Update the active tab in the server to the new tab
    if (active !== false) {
      await api.tabs.select(tabData.id)
    }
    return tabData
  }
)
