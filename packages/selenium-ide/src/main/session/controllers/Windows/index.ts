import * as windowConfigs from 'browser/windows/controller'
import { WindowConfig } from 'browser/types'
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { existsSync, readFileSync } from 'fs'
import kebabCase from 'lodash/fp/kebabCase'
import { Session } from 'main/types'
import { join } from 'path'

const playbackCSS = readFileSync(join(__dirname, 'highlight.css'), 'utf-8');

export type WindowLoader = (opts?: BrowserWindowConstructorOptions) => BrowserWindow
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
      const windowLoader: WindowLoaderFactory =
        (session: Session) =>
        (options: BrowserWindowConstructorOptions = {}) => {
          if (menus) menus(session.menu)
          const windowConfig = window(session)
          const win = new BrowserWindow({
            ...windowConfig,
            webPreferences: {
              preload: hasPreload ? preloadPath : undefined,
            },
            ...options,
          })
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
    this.playbackWindows = []
    this.windows = {}

  }
  session: Session
  playbackWindows: BrowserWindow[]
  windowLoaders: WindowLoaderMap
  windows: { [key: string]: BrowserWindow }

  async broadcast(path: string, ...args: any) {
    Object.values(this.windows).forEach((window) => {
      window.webContents.send(path, ...args)
    })
  }

  async get(name: string): Promise<BrowserWindow> {
    return this.windows[name]
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

  async open(name: string, opts: BrowserWindowConstructorOptions = {}): Promise<boolean> {
    if (!this.windowLoaders[name]) {
      throw new Error(`Invalid window name supplied '${name}'!`)
    }
    if (this.windows[name]) {
      return false
    }
    const window = this.windowLoaders[name](opts)
    if (name === 'playback-window') {
      this.handlePlaybackWindow(window)
    }
    this.windows[name] = window
    return true
  }

  handlePlaybackWindow(window: BrowserWindow) {
    this.playbackWindows.push(window)
    window.webContents.insertCSS(playbackCSS)
    window.webContents.setWindowOpenHandler(() => ({
      action: 'allow',
      overrideBrowserWindowOptions: {
        webPreferences: {
          preload: join(__dirname, `playback-window-preload-bundle.js`),
        },
      },
    }))
    window.webContents.on('did-create-window', win => this.handlePlaybackWindow(win));
    window.on('closed', () => this.playbackWindows.splice(this.playbackWindows.indexOf(window)));
  }
}
