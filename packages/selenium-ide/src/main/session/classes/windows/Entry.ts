import { BrowserWindow } from 'electron'
import { Session } from 'main/types'
import { WindowData } from 'polyfill/types'
import { GenericEntry } from '../generic/Entry'
import TabsEntry from '../tabs/Entry'
import TabsList from '../tabs/List'

export default class WindowEntry extends GenericEntry<WindowData> {
  constructor(session: Session, window: BrowserWindow) {
    super()
    this.id = window.webContents.id
    this.tabs = new TabsList(session, this)
    this.window = window
    this.data = WindowEntry.deriveData(this)
    window
      .getBrowserViews()
      .forEach((view) => this.tabs.create(new TabsEntry(view, this)))
  }
  static deriveData({ tabs, window }: WindowEntry): WindowData {
    const { height, width } = window.getBounds()
    return {
      focused: window.isFocused(),
      height,
      id: window.webContents.id,
      tabs: tabs.entries.map((tab) => TabsEntry.deriveData(tab)),
      width,
    }
  }
  data: WindowData
  id: number
  tabs: TabsList
  window: BrowserWindow
}
