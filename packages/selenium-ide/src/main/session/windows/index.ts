import { BrowserWindow } from 'electron'
import { WindowData } from 'polyfill/types'
import { Session } from '../../types'
import TabsManager, { TabEntry, TabManager } from './tabs'

export interface WindowEntry {
  tabs: TabManager
  window: BrowserWindow
}

const buildWindowManager = (session: Session) => {
  const windowIDs: number[] = []
  const windows: WindowEntry[] = []

  const read = (windowID: number): WindowEntry => {
    const index = windowIDs.indexOf(windowID)
    return windows[index]
  }
  const withTab = (tabID: number): WindowEntry =>
    windows.find(({ tabs }) => tabs.has(tabID)) as WindowEntry

  return {
    all: windows,
    create: (window: BrowserWindow): WindowEntry => {
      const windowID = window.id
      const tabs = TabsManager(session, window)
      const entry = { tabs, window }
      windows.push(entry)
      windowIDs.push(windowID)
      return entry
    },
    getTab: (tabID: number): TabEntry => withTab(tabID).tabs.read(tabID),
    remove: (windowID: number): WindowEntry => {
      const index = windowIDs.indexOf(windowID)
      const [window] = windows.splice(index, 1)
      windowIDs.splice(index, 1)
      return window
    },
    getActive: (): number => {
      const activeWindow = BrowserWindow.getFocusedWindow() || windows[0].window
      return activeWindow.id
    },
    getData: (entry: WindowEntry): WindowData => {
      const { window } = entry
      const { height, width } = window.getBounds()
      return {
        focused: window.isFocused(),
        height,
        id: window.id,
        tabs: entry.tabs.all.map(({ data }) => data),
        width,
      }
    },
    read,
    readIndex: (index: number): WindowEntry => windows[index],
    withTab,
    select: (windowID: number): void => {
      read(windowID).window.focus()
    },
  }
}

export type WindowManager = ReturnType<typeof buildWindowManager>
export default buildWindowManager
