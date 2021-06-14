import { TabShim } from '../types'

interface ShimOverrides {
  title: string
  url: string
}

const getTabManager = () => {
  let activeTabID: number = 0
  const tabs: Electron.BrowserView[] = []
  const tabIDs: number[] = []

  const add = (view: Electron.BrowserView): number => {
    const tabID = view.webContents.id
    tabs.push(view)
    tabIDs.push(tabID)
    return tabID
  }

  const get = (tabID: number): Electron.BrowserView => {
    const index = tabIDs.indexOf(tabID)
    return tabs[index]
  }

  const getShim = (tabID: number, { title, url }: ShimOverrides): TabShim => {
    const view = tabs[tabIDs.indexOf(tabID)]
    return {
      active: tabID === activeTabID,
      id: tabID,
      status: view.webContents.isLoading() ? 'loading' : 'complete',
      title: title || view.webContents.getTitle(),
      url: url || view.webContents.getURL(),
      windowId: tabID,
    }
  }

  const getIDFromIndex = (index: number): number => {
    return tabIDs[index]
  }

  const getActive = (): number => activeTabID

  const select = (tabID: number): Electron.BrowserView => {
    activeTabID = tabID
    return get(tabID)
  }

  const remove = (tabID: number): Electron.BrowserView => {
    const index = tabIDs.indexOf(tabID)
    const [tab] = tabs.splice(index, 1)
    tabIDs.splice(index, 1)
    return tab
  }

  return {
    add,
    get,
    getActive,
    getIDFromIndex,
    getShim,
    remove,
    select,
  }
}

export type TabManager = ReturnType<typeof getTabManager>
export default getTabManager
