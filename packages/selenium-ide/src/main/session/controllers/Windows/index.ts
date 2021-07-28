import * as windowConfigs from 'browser/windows/controller'
import { WindowConfig } from 'browser/types'
import { BrowserWindow } from 'electron'
import { existsSync } from 'fs'
import kebabCase from 'lodash/fp/kebabCase'
import merge from 'lodash/fp/merge'
import { Session } from 'main/types'
import { join } from 'path'

export type WindowLoader = () => BrowserWindow
export interface WindowLoaderMap {
  [key: string]: WindowLoader
}
export type WindowLoaderFactory = (session: Session) => WindowLoader
export interface WindowLoaderFactoryMap {
  [key: string]: WindowLoaderFactory
}
const windowLoaderFactoryMap: WindowLoaderFactoryMap = Object.fromEntries(
  Object.entries(windowConfigs).map(
    ([key, { menus, window }]: [string, WindowConfig]) => {
      const filename = kebabCase(key)
      const preloadPath = join(__dirname, `${filename}-preload-bundle.js`)
      const hasPreload = existsSync(preloadPath)
      const windowLoader: WindowLoaderFactory = (session: Session) => () => {
        if (menus) menus(session.menu)
        const win = new BrowserWindow(
          merge(window, {
            webPreferences: {
              preload: hasPreload ? preloadPath : undefined,
            },
          })
        )
        win.loadFile(join(__dirname, `${filename}.html`))
        return win
      }
      return [key, windowLoader]
    }
  )
)

const makeWindowLoaders = (session: Session): WindowLoaderMap =>
  Object.fromEntries(
    Object.entries(windowLoaderFactoryMap).map(([key, loader]) => [
      kebabCase(key),
      loader(session),
    ])
  )

export default class WindowsController {
  constructor(session: Session) {
    this.windowLoaders = makeWindowLoaders(session)
    this.session = session
    this.windows = {}
  }
  session: Session

  windowLoaders: WindowLoaderMap
  windows: { [key: string]: BrowserWindow }
  async open(name: string): Promise<BrowserWindow> {
    if (!this.windowLoaders[name]) {
      throw new Error(`Invalid window name supplied '${name}'!`)
    }
    const window = this.windowLoaders[name]()
    this.windows[name] = window
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
