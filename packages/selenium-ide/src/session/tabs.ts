import { TabData } from '../types'
import { Session } from '../types/server'

interface TabsEntry {
  view: Electron.BrowserView
  data: TabData
}

const buildTabManager = (session: Session) => {
  let activeTabID: number = 0
  const tabIDs: number[] = []
  const tabs: TabsEntry[] = []

  const makeData = (view: Electron.BrowserView, url: string): TabData => {
    const tabID = view.webContents.id
    return {
      active: tabID === activeTabID,
      id: tabID,
      status: 'loading',
      title: 'Loading...',
      url,
      windowId: 0,
    }
  }

  const read = (tabID: number): TabsEntry => {
    const index = tabIDs.indexOf(tabID)
    return tabs[index]
  }

  return {
    create: (view: Electron.BrowserView, url: string): TabsEntry => {
      const tabID = view.webContents.id
      const tab = { data: makeData(view, url), view }
      tabs.push(tab)
      tabIDs.push(tabID)
      session.api.events.tabs.onUpdated(tab.data, tab.data)
      return tab
    },
    remove: (tabID: number): TabsEntry => {
      const index = tabIDs.indexOf(tabID)
      const [tab] = tabs.splice(index, 1)
      tabIDs.splice(index, 1)
      session.api.events.tabs.onRemoved(tab.data)
      return tab
    },
    getActive: (): number => activeTabID,
    read,
    readIndex: (index: number): TabsEntry => tabs[index],
    select: (tabID: number): TabsEntry => {
      activeTabID = tabID
      const tab = read(tabID)
      session.api.events.tabs.onActivated(tab.data)
      return tab
    },
    update: (tabID: number, changeInfo: Partial<TabData>): TabsEntry => {
      const tab = read(tabID)
      const tabData = Object.assign(tab.data, changeInfo)
      session.api.events.tabs.onUpdated(changeInfo, tabData)
      tab.data = tabData
      return tab
    },
  }
}

export type TabManager = ReturnType<typeof buildTabManager>
export default buildTabManager
