import Handler from 'browser/helpers/Handler'
import { TabData } from 'polyfill/types'
import { Session } from 'main/types'

export const browser = Handler()

export const main =
  (_path: string, session: Session) => async (tabQuery: Partial<TabData>) => {
    const { windows } = session
    const { id, windowId } = tabQuery
    let matchingWindows = windowId ? [windows.read(windowId)] : windows.all
    const tabsArray: TabData[] = []
    return matchingWindows.reduce((results, { tabs }) => {
      const matchingTabs = id ? tabs.query({ id }) : tabs.all
      return results.concat(matchingTabs.map((tab) => tab.data))
    }, tabsArray)
  }
