import { BrowserView, BrowserWindow } from 'electron'
import { TabData } from 'polyfill/types'
import { Session } from '../../types'

export interface TabEntry {
  view: BrowserView
  data: TabData
}

const buildTabManager = (session: Session, window: BrowserWindow) => {
  let activeTabID: number = 0
  const tabIDs: number[] = []
  const tabs: TabEntry[] = []

  const makeData = (view: BrowserView, url: string): TabData => {
    const tabID = view.webContents.id
    return {
      active: tabID === activeTabID,
      id: tabID,
      status: 'loading',
      title: 'Loading...',
      url,
      // We make the first windowId unique for seleniumIDE
      windowId: window.id,
    }
  }

  const read = (tabID: number): TabEntry => {
    const index = tabIDs.indexOf(tabID)
    return tabs[index]
  }

  return {
    all: tabs,
    create: (view: BrowserView, url: string): TabEntry => {
      const tabID = view.webContents.id
      const tab = { data: makeData(view, url), view }
      tabs.push(tab)
      tabIDs.push(tabID)
      session.api.tabs.onUpdated.dispatchEvent(tabID, tab.data, tab.data)
      return tab
    },
    getActive: (): number => activeTabID,
    has: (tabID: number): boolean => tabIDs.includes(tabID),
    query: (data: Partial<TabData>) =>
      tabs.filter((tab) => {
        for (const key in data) {
          if (data[key] !== tab.data[key]) {
            return false
          }
        }
        return true
      }),
    read,
    readIndex: (index: number): TabEntry => tabs[index],
    remove: (tabID: number): TabEntry => {
      const index = tabIDs.indexOf(tabID)
      const [tab] = tabs.splice(index, 1)
      tabIDs.splice(index, 1)
      session.api.tabs.onRemoved.dispatchEvent(tab.data.id, {
        isWindowClosing: false,
        windowId: window.id,
      })
      return tab
    },
    select: (tabID: number): TabEntry => {
      activeTabID = tabID
      const tab = read(tabID)
      session.api.tabs.onActivated.dispatchEvent({
        tabId: tab.data.id,
        windowId: window.id,
      })
      return tab
    },
    update: (tabID: number, changeInfo: Partial<TabData>): TabEntry => {
      const tab = read(tabID)
      const tabData = Object.assign(tab.data, changeInfo)
      session.api.tabs.onUpdated.dispatchEvent(tabID, changeInfo, tabData)
      tab.data = tabData
      return tab
    },
  }
}

export type TabManager = ReturnType<typeof buildTabManager>
export default buildTabManager
