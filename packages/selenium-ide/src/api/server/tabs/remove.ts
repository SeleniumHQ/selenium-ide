import { TabData } from '../../../types'
import { Session } from '../../../types/server'

export default (session: Session) => async (
  tabID: number
): Promise<TabData> => {
  // Add our Selenium IDE v3 page as a tab
  const { api, tabs, window } = session
  const { getActive, readIndex } = tabs
  const { data, view } = tabs.remove(tabID)
  window.removeBrowserView(view)
  if (getActive() === tabID) {
    const firstTabID = readIndex(0)
    await api.server.tabs.select(firstTabID.view.webContents.id)
  }
  return data
}
