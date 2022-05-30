import * as windowConfigs from 'browser/windows/controller'
import { WindowConfig } from 'browser/types'
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { existsSync, readFileSync } from 'fs'
import kebabCase from 'lodash/fp/kebabCase'
import { Session } from 'main/types'
import storage from 'main/store'
import { join } from 'path'
import BaseController from '../Base'

// import { StopOutlined } from '@mui/icons-material'

const playbackWindowName = 'playback-window'
const playbackCSS = readFileSync(join(__dirname, 'highlight.css'), 'utf-8')
const playbackWindowOptions = {
  webPreferences: {
    nodeIntegration: false,
    nodeIntegrationInSubFrames: true,
    preload: join(__dirname, `playback-window-preload-bundle.js`),
  },
}

const projectEditorWindowName = 'project-editor'

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
              ...(windowConfig?.webPreferences ?? {}),
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

export default class WindowsController extends BaseController {
  playbackWindows: BrowserWindow[] = []
  windowLoaders: WindowLoaderMap = makeWindowLoaders(this.session)
  windows: { [key: string]: BrowserWindow } = {}

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
    const playbackWindows = this.playbackWindows
    playbackWindows.forEach((window) => window.close())
    this.playbackWindows = []
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
    this.windows[name] = window
    window.on('closed', () => {
      if (!name.startsWith(projectEditorWindowName)) delete this.windows[name]
    })
    return true
  }

  async openPlaybackWindow(opts: BrowserWindowConstructorOptions = {}) {
    const window = this.windowLoaders[playbackWindowName](opts)
    this.handlePlaybackWindow(window)
    return true
  }

  handlePlaybackWindow(window: BrowserWindow) {
    this.playbackWindows.push(window)
    window.webContents.insertCSS(playbackCSS)
    window.webContents.setWindowOpenHandler(() => ({
      action: 'allow',
      overrideBrowserWindowOptions: playbackWindowOptions,
    }))
    window.webContents.on('did-create-window', (win) =>
      this.handlePlaybackWindow(win)
    )
    // This block listens for frames to be created
    // Upon being so, we check if our API is available
    // If not, we reload and check again until it is.
    // This is to overcome a quirk in Electron where
    // the preload scripts will sometimes just fail to register or something
    window.webContents.on('frame-created', async (_event, details) => {
      await details.frame.once('dom-ready', async () => {
        const hasAPI = await details.frame.executeJavaScript('window.sideAPI')
        if (!hasAPI) {
          details.frame.reload()
        }
        await this.session.api.recorder.onFrameRecalculate.dispatchEvent()
      })
    })
    // Keeps playback window list ordered according to interactions
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
    await this.initializePlaybackWindow()
    await this.close('splash')

    await this.open(projectEditorWindowName)
    const projectWindow = await this.get(projectEditorWindowName)
    const size = storage.get<'windowSize'>('windowSize')
    const position = storage.get<'windowPosition'>('windowPosition')

    if (size.length) projectWindow.setSize(size[0], size[1], true)
    if (position.length) projectWindow.setPosition(position[0], position[1])
    projectWindow.show()

    projectWindow.on('close', async (e) => {
      if (!this.session.system.isDown) {
        e.preventDefault()
        await this.session.system.shutdown()
        if (this.session.system.isDown) {
          await this.close(projectEditorWindowName)
        }
      }
    })
    projectWindow.on('moved', () => {
      const position = projectWindow.getPosition() as [number, number]
      storage.set<'windowPosition'>('windowPosition', position)
    })
    projectWindow.on('resize', () => {
      const size = projectWindow.getSize() as [number, number]
      storage.set<'windowSize'>('windowSize', size)
    })
  }

  async onProjectUnloaded() {
    this.closeAll()
  }

  async initializePlaybackWindow() {
    this.playbackWindows.forEach((bw) => bw.close())
    await this.openPlaybackWindow()
  }

  async getPlaybackWindow() {
    return this.playbackWindows.slice(-1)[0]
  }
}
