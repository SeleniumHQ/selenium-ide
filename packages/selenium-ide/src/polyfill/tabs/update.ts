import Handler from 'browser/helpers/Handler'
import { TabData } from 'polyfill/types'
import { Session } from 'main/types'

export const browser = Handler()

export interface AddTabOptions {
  isExtension?: boolean
}

export const main =
  (_path: string, session: Session) =>
  async (tabID: number, tabData: Partial<TabData>): Promise<TabData> => {
    const { windows } = session
    const { tabs } = windows.withTab(tabID)
    // Only our approved extension gets bootstrapped, for now
    const tab = tabs.read(tabID)
    if (tabData.url && tabData.url !== tab.view.webContents.getURL()) {
      tab.view.webContents.loadURL(tabData.url)
    }
    // Update the tab data
    tabs.update(tabID, tabData)
    return tab.data
  }
