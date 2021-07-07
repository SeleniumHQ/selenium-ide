import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'
import { TabData } from 'polyfill/types'

export type Shape = (tabID: number) => TabData

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>((_path, session) => async (tabID) => {
  // Add our Selenium IDE v3 page as a tab
  const { tabs } = session.windows.withTab(tabID)
  const { activeTabID, readIndex } = tabs
  const { data } = tabs.delete(tabID)
  if (activeTabID === tabID) {
    const firstTabID = readIndex(0)
    tabs.select(firstTabID.view.webContents.id)
  }
  return data
})
