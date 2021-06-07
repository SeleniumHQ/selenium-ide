export let tabID = 0
export let activeTabID = 0
export const tabs: { [key: number]: Electron.BrowserView } = {}

export const add = (view: Electron.BrowserView) => {
  tabID += 1
  tabs[tabID] = view
  return tabID
}

export const getActive = () => activeTabID

export const select = (tabID: number) => {
  activeTabID = tabID
}

export const remove = (tabID: number) => {
  const tab = tabs[tabID]
  delete tabs[tabID]
  return tab
}

export default {
  add,
  getActive,
  remove,
  select,
  tabs,
  tabID,
}
