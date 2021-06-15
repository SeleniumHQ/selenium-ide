import { TabData } from '../../../types'
import { Session } from '../../../types/server'

export interface AddTabOptions {
  isExtension?: boolean
}

export default ({ api, tabs }: Session) => async (
  tabId: number,
  tabData: Partial<TabData>
): Promise<TabData> => {
  // Only our approved extension gets bootstrapped, for now
  const tab = tabs.read(tabId)
  if (tabData.url && tabData.url !== tab.view.webContents.getURL()) {
    tab.view.webContents.loadURL(tabData.url)
  }
  // Update the tab data
  await api.client.tabs.update(tabData)
  return tab.data
}
