import { BrowserWindow } from 'electron'
import { Session } from 'main/types'
import { WindowData } from 'polyfill/types'
import GenericList from '../generic/List'
import TabsEntry from '../tabs/Entry'
import WindowEntry from './Entry'

export default class WindowList extends GenericList<WindowEntry> {
  constructor(session: Session) {
    super()
    this.session = session
  }
  session: Session
  create(entry: WindowEntry): WindowEntry {
    super.create(entry)
    this.onCreate(entry)
    return entry
  }
  onCreate(entry: WindowEntry): void {
    this.session.api.windows.onCreated.dispatchEvent(entry.data)
  }
  delete(id: number): WindowEntry {
    const entry = super.delete(id)
    this.onDelete(id)
    return entry
  }
  onDelete(id: number): void {
    this.session.api.windows.onRemoved.dispatchEvent(id)
  }
  getTab(tabID: number): TabsEntry {
    return this.withTab(tabID).tabs.read(tabID)
  }
  getActive(): number {
    const activeWindow = BrowserWindow.getFocusedWindow() || this.entries[0]
    return activeWindow.id
  }
  withTab(tabID: number): WindowEntry {
    return this.entries.find(({ tabs }) => tabs.has(tabID)) as WindowEntry
  }
  select(id: number): void {
    this.read(id).window.focus()
  }
  onSelect(id: number): void {
    this.read(id).window.focus()
    this.session.api.windows.onFocusChanged.dispatchEvent(id)
  }
  update(id: number, changeInfo: Partial<WindowData>): WindowEntry {
    const entry = super.update(id, changeInfo)
    if (changeInfo.focused) {
      this.select(id)
    }
    return entry
  }
}
