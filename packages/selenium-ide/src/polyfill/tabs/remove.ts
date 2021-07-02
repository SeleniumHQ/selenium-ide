import Handler from 'browser/helpers/Handler'
import { TabData } from 'polyfill/types'
import { Session } from 'main/types'

export const browser = Handler()

export const main =
  (_path: string, session: Session) =>
  async (tabID: number): Promise<TabData> => {
    // Add our Selenium IDE v3 page as a tab
    const { api, windows } = session
    const { tabs, window } = windows.withTab(tabID)
    const { getActive, readIndex, remove } = tabs
    const { data, view } = remove(tabID)
    window.removeBrowserView(view)
    if (getActive() === tabID) {
      const firstTabID = readIndex(0)
      await api.tabs.select(firstTabID.view.webContents.id)
    }
    return data
  }
