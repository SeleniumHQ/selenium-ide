import { BrowserWindow, BrowserView } from 'electron'
import { TabData } from 'polyfill/types'
import { GenericEntry } from '../generic/Entry'
import WindowEntry from '../windows/Entry'

const setActiveTab = (window: BrowserWindow, tab: BrowserView) => {
  const bounds = window.getBounds()
  tab.setBounds({
    x: 0,
    y: 33,
    width: bounds.width,
    // We leave a bit of extra margin here to deal with this:
    // https://github.com/electron/electron/issues/13468#issuecomment-445441789
    height: bounds.height - 50,
  })
  tab.setAutoResize({
    height: true,
    horizontal: false,
    vertical: false,
    width: true,
  })
}

const setInactiveTab = (tab: BrowserView) => {
  tab.setBounds({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  tab.setAutoResize({
    height: false,
    horizontal: false,
    vertical: false,
    width: false,
  })
}

export default class TabsEntry extends GenericEntry<TabData> {
  constructor(view: BrowserView, window: WindowEntry) {
    super()
    this.id = view.webContents.id
    this.view = view
    this.window = window
    this.data = TabsEntry.deriveData(this)
  }
  data: TabData
  id: number
  view: BrowserView
  window: WindowEntry
  setActive(active: boolean) {
    this.data.active = active
    if (active) setActiveTab(this.window.window, this.view)
    else setInactiveTab(this.view)
  }
  static deriveData({ view, window }: TabsEntry): TabData {
    const tabID = view.webContents.id
    return {
      active: tabID === window.tabs.activeTabID,
      id: tabID,
      status: 'loading',
      title: 'Loading...',
      url: view.webContents.getURL(),
      windowId: window.id,
    }
  }
}
