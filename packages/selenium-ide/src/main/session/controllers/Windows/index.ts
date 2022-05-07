import * as windowConfigs from 'browser/windows/controller'
import { WindowConfig } from 'browser/types'
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { existsSync, readFileSync } from 'fs'
import kebabCase from 'lodash/fp/kebabCase'
import { Session } from 'main/types'
import storage from 'main/store'
import { join } from 'path'

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

export default class WindowsController {
  constructor(session: Session) {
    this.session = session
    this.playbackWindows = []
    this.windowLoaders = makeWindowLoaders(session)
    this.windows = {}
  }
  playbackWindows: BrowserWindow[]
  session: Session
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
    const playbackWindows = this.playbackWindows
    playbackWindows.forEach((window) => window.close())
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
      if (!name.startsWith(projectEditorWindowName)) delete this.windows[name]
    })
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
    window.webContents.on('frame-created', async (_event, details) => {
      await details.frame.once('dom-ready', async () => {
        const hasAPI = await details.frame.executeJavaScript('window.sideAPI')
        if (!hasAPI) {
          details.frame.reload()
        }
      })
    })
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
    await this.open(projectEditorWindowName)
    await this.close('splash')

    this.playbackWindows.forEach((bw) => {
      if (!bw.closable) {
        bw.closable = true
      }
      bw.close()
    })

    await this.close(playbackWindowName)
    await this.open(playbackWindowName)
    const playbackWindow = await this.get(playbackWindowName)
    this.handlePlaybackWindow(playbackWindow)

    const projectWindow = await this.get(projectEditorWindowName)
    let position, size: number[]

    size = storage.get<'windowSize'>('windowSize', [552, 664])
    position = storage.get<'windowPosition'>('windowPosition', [982, 20])
    
    projectWindow.setSize(size[0], size[1], true)
    projectWindow.setPosition(position[0], position[1])
    projectWindow.show()

    projectWindow.on('closed', () => {
      console.debug('projectWindow on closed')
      BrowserWindow.getAllWindows().forEach((win) => {
        console.debug('found win, closable ' + win.closable)
        if (!win.closable) {
          win.closable = true
        }
        win.close()
      })
    })
    projectWindow.on('close', (e) => {
      e.preventDefault()
      this.session.state.onProjectUnloaded()
      this.session.system.quit()
    })
    projectWindow.on('moved', function () {
      var position = projectWindow.getPosition()
      storage.set<'windowPosition'>('windowPosition', position)
      console.log(' x: ' + position[0] + ' y: ' + position[1])
    })
    projectWindow.on('resize', function () {
      var size = projectWindow.getSize()
      storage.set<'windowSize'>('windowSize', size)
      console.log('w:' + size[0] + ' h: ' + size[1] + ' x: ')
    })
  }

  async initializePlaybackWindow() {
    this.playbackWindows.forEach((bw) => {
      if (!bw.closable) {
        bw.closable = true
      }
      bw.close()
    })

    await this.close(playbackWindowName)
    await this.open(playbackWindowName)
  }

  async getPlaybackWindow() {
    const playbackWindow = await this.playbackWindows.slice(-1)[0]
    if (playbackWindow) return playbackWindow
    else {
      await this.open('playback-window')
      return this.get('playback-window')
    }
  }
}
