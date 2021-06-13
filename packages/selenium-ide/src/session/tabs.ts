const getTabManager = () => {
  let tabID = 0
  let activeTabID: number = 0
  const tabs: Electron.BrowserView[] = []
  const tabIDs: number[] = []

  const add = (view: Electron.BrowserView) => {
    tabID += 1
    tabs.push(view)
    tabIDs.push(tabID)
    return tabID
  }

  const get = (tabID: number): Electron.BrowserView => {
    const index = tabIDs.indexOf(tabID)
    return tabs[index]
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
    remove,
    select,
  }
}

export type TabManager = ReturnType<typeof getTabManager>
export default getTabManager
