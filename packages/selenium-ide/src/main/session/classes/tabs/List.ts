import { BrowserView } from 'electron'
import { Session } from 'main/types'
import { TabData } from 'polyfill/types'
import GenericList from '../generic/List'
import TabsEntry from './Entry'
import WindowEntry from '../windows/Entry'

export const allTabs: TabsEntry[] = []

export default class TabsList extends GenericList<TabsEntry> {
  activeTabID: number
  session: Session
  window: WindowEntry
  constructor(session: Session, window: WindowEntry) {
    super()
    this.activeTabID = 0
    this.session = session
    this.window = window
  }
  createForWindow(view: BrowserView) {
    return this.create(new TabsEntry(view, this.window))
  }
  create(entry: TabsEntry): TabsEntry {
    super.create(entry)
    if (!this.activeTabID) {
      this.select(entry.id)
    }
    this.window.tabs.entries.push(entry)
    this.window.data.tabs.push(entry.data)
    this.onCreate(entry)
    return entry
  }
  onCreate(entry: TabsEntry) {
    allTabs.push(entry)
    const data = TabsEntry.deriveData(entry)
    this.session.api.tabs.onCreated.dispatchEvent(data)
    this.session.api.tabs.onUpdated.dispatchEvent(entry.id, data, data)
  }
  delete(tabID: number) {
    const index = this.entries.findIndex((entry) => entry.id === tabID)
    this.window.data.tabs.splice(index, 1)
    this.window.window.removeBrowserView(this.entries[index].view)
    return super.delete(tabID)
  }
  onDelete(id: number) {
    this.session.api.tabs.onRemoved.dispatchEvent(id, {
      isWindowClosing: false,
      windowId: this.window.id,
    })
  }
  select(selectedTabID: number): void {
    const { activeTabID } = this
    if (selectedTabID !== activeTabID) {
      this.read(selectedTabID).setActive(true)
      /**
       * Reasons not to inactivate the prior window:
       * 1. It never existed (first window is selected)
       * 2. Its just been removed
       */
      if (activeTabID !== 0) {
        const activeTab = this.read(activeTabID)
        if (activeTab) {
          activeTab.setActive(false)
        }
      }
    }
    this.activeTabID = selectedTabID
    this.onSelect(selectedTabID)
  }
  onSelect(selectedTabID: number): void {
    this.session.api.tabs.onActivated.dispatchEvent({
      tabId: selectedTabID,
      windowId: this.window.id,
    })
  }
  update(tabID: number, changeInfo: Partial<TabData>): TabsEntry {
    const newTab = super.update(tabID, changeInfo)
    if (changeInfo.url && changeInfo.url !== newTab.view.webContents.getURL()) {
      newTab.view.webContents.loadURL(changeInfo.url)
    }
    if (changeInfo.active) {
      this.select(tabID)
    }
    this.onUpdate(tabID, changeInfo)
    return newTab
  }
  onUpdate(tabID: number, changeInfo: Partial<TabData>) {
    this.session.api.tabs.onUpdated.dispatchEvent(
      tabID,
      changeInfo,
      this.read(tabID).data
    )
  }
}
