import { TabData } from '../../../types'
import { Session } from '../../../types/server'

export interface AddTabOptions {
  isExtension?: boolean
}

export default (session: Session) => async (
  tabId: number,
  tabData: Partial<TabData>
): Promise<TabData> => {
  const { api, tabs } = session
  // Only our approved extension gets bootstrapped, for now
  const tab = tabs.read(tabId)
  if (tabData.url && tabData.url !== tab.view.webContents.getURL()) {
    tab.view.webContents.loadURL(tabData.url)
  }
  // Update the tab data
  await api.client.tabs.update(tabData)
  tabs.update(tabId, tabData)
  return tab.data
}
