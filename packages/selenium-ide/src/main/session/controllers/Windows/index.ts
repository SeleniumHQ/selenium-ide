import { BrowserWindow, Menu } from 'electron'
import { Session } from 'main/types'

export interface WindowConfig {
  menus: (menu: Menu) => void
  name: string
  window: () => BrowserWindow
}

export default class WindowsController {
  constructor(session: Session) {
    this.session = session
    this.windows = {}
  }
  session: Session
  windows: { [key: string]: BrowserWindow }
  async open(config: WindowConfig): Promise<BrowserWindow> {
    const window = config.window()
    this.windows[config.name] = window
    return window
  }
  async close(name: string): Promise<boolean> {
    const window = this.windows[name]
    if (!window) {
      return false
    }
    delete this.windows[name]
    window.close()
    return true
  }
}
