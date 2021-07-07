import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'
import { TabData } from 'polyfill/types'

export interface AddTabOptions {
  isExtension?: boolean
}

export type Shape = (
  tabID: number,
  tabData: Partial<TabData>
) => TabData

export const browser = browserHandler<Shape>()
export const main = mainHandler<Shape>(
  (_path, session) => async (tabID, tabData) => {
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
)
