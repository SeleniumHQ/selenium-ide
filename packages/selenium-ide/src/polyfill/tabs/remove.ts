import browserHandler from 'browser/helpers/Handler'
import mainHandler from 'main/helpers/Handler'
import { TabData } from 'polyfill/types'

export type Shape = (tabID: number) => Promise<TabData>

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>((_path, session) => async (tabID) => {
  // Add our Selenium IDE v3 page as a tab
  const { api, windows } = session
  const { tabs, window } = windows.withTab(tabID)
  const { getActive, readIndex, remove } = tabs
  const { data, view } = remove(tabID)
  window.removeBrowserView(view)
  if (getActive() === tabID) {
    const firstTabID = readIndex(0)
    await api.tabs.select(firstTabID.view.webContents.id)
  }
  return data
})
