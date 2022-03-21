import * as windowConfigs from 'browser/windows/controller'
import { WindowConfig } from 'browser/types'
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { existsSync, readFileSync } from 'fs'
import kebabCase from 'lodash/fp/kebabCase'
import { Session } from 'main/types'
import { join } from 'path'

const mainWindowName = 'playback-window'
const childWindowNames = ['playback-controls', 'project-editor']
const playbackCSS = readFileSync(join(__dirname, 'highlight.css'), 'utf-8')

export type WindowLoader = (
  opts?: BrowserWindowConstructorOptions
) => BrowserWindow
export interface WindowLoaderMap {
  [key: string]: WindowLoader
}
export type WindowLoaderFactory = (session: Session) => WindowLoader
export interface WindowLoaderFactoryMap {
  [key: string]: WindowLoaderFactory
}
const windowLoaderFactoryMap: WindowLoaderFactoryMap = Object.fromEntries(
  Object.entries(windowConfigs).map(
    ([key, { window }]: [string, WindowConfig]) => {
      const filename = kebabCase(key)
      const preloadPath = join(__dirname, `${filename}-preload-bundle.js`)
      const hasPreload = existsSync(preloadPath)
      const windowLoader: WindowLoaderFactory =
        (session: Session) =>
        (options: BrowserWindowConstructorOptions = {}) => {
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

  async close(name: string): Promise<boolean> {
    const window = this.windows[name]
    if (!window) {
      return false
    }
    delete this.windows[name]
    window.close()
    return true
  }

  async closeAll(): Promise<void> {
    this.windows = {}
    this.playbackWindows = []
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((window) => window.close())
  }

  async get(name: string): Promise<BrowserWindow> {
    return this.windows[name]
  }
  getLastPlaybackWindow(): BrowserWindow {
    return this.playbackWindows[this.playbackWindows.length - 1]
  }

  async open(
    name: string,
    opts: BrowserWindowConstructorOptions = {}
  ): Promise<boolean> {
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
    window.on('closed', () => {
      delete this.windows[name]
    })
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
    window.webContents.on('did-create-window', (win) =>
      this.handlePlaybackWindow(win)
    )

    window.on('focus', () => {
      const windowIndex = this.playbackWindows.indexOf(window)
      if (windowIndex !== this.playbackWindows.length - 1) {
        this.playbackWindows.splice(windowIndex, 1)
        this.playbackWindows.push(window)
      }
    })
    window.on('closed', () =>
      this.playbackWindows.splice(this.playbackWindows.indexOf(window), 1)
    )
  }

  async onProjectLoaded() {
    await this.closeAll()
    await Promise.all(
      [mainWindowName]
        .concat(childWindowNames)
        .map((name: string) => this.open(name))
    )
    const mainWindow = await this.get(mainWindowName)
    mainWindow.webContents.setWindowOpenHandler((details) => {
      this.session.recorder.handleNewWindow(details)
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            preload: join(__dirname, `playback-window-preload-bundle.js`),
          },
        },
      }
    })
    const childWindows = await Promise.all(
      childWindowNames.map((name) => this.get(name))
    )
    mainWindow.on('focus', () => {
      childWindows.forEach((win) => {
        win.showInactive()
      })
    })
    mainWindow.on('blur', () => {
      const windows = BrowserWindow.getAllWindows()
      const anyWindowFocused = windows.reduce((focused, window) => {
        if (focused) return true
        return window.isFocused()
      }, false)
      if (!anyWindowFocused) {
        childWindows.forEach((win) => {
          win.hide()
        })
      }
    })
    mainWindow.on('closed', () => {
      childWindows.forEach((win) => {
        win.destroy()
      })
    })
  }
}
