import browserHandler from 'browser/helpers/Handler'
import mainHandler from 'main/helpers/Handler'
import { TabData } from 'polyfill/types'

export type Shape = (tabQuery: Partial<TabData>) => Promise<TabData[]>

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>((_path, session) => async (tabQuery) => {
  const { windows } = session
  const { id, windowId } = tabQuery
  let matchingWindows = windowId ? [windows.read(windowId)] : windows.all
  const tabsArray: TabData[] = []
  return matchingWindows.reduce((results, { tabs }) => {
    const matchingTabs = id ? tabs.query({ id }) : tabs.all
    return results.concat(matchingTabs.map((tab) => tab.data))
  }, tabsArray)
})
