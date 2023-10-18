import { ipcMain } from 'electron'
import Commands from '@seleniumhq/side-model/dist/Commands'
import * as windowConfigs from 'browser/windows/controller'
import { WindowConfig } from 'browser/types'
import electron, {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Menu,
} from 'electron'
import { existsSync, readFileSync } from 'fs'
import kebabCase from 'lodash/fp/kebabCase'
import { Session } from 'main/types'
import storage from 'main/store'
import { join } from 'node:path'
import BaseController from '../Base'
import { isAutomated } from 'main/util'

const playbackWindowName = 'playback-window'
const playbackCSS = readFileSync(join(__dirname, 'highlight.css'), 'utf-8')
const playbackWindowOptions = {
  webPreferences: {
    devTools: !isAutomated,
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
              devTools: !isAutomated,
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

  constructor (session: Session) {
    super(session)
    ipcMain.handle('show-shortcut-menu', async (event) => {
      if (session.state.state.status != 'recording') {
        return null
      }
      return new Promise((resolve) => {
        let contextMenuParams: Electron.ContextMenuParams
        let handled = false
        const template = [
          'verifyText',
          'verifyChecked',
          'verifyElementPresent',
          'waitForElementVisible',
        ].map((cmd) => {
          return {
            label: Commands[cmd].name,
            click () {
              handled = true
              resolve({
                cmd,
                params: contextMenuParams
              })
            }
          }
        })
        const menu = Menu.buildFromTemplate([{
          label: 'Selenium IDE',
          submenu: template
        }])
        menu.once('menu-will-close', () => {
          // execute after menu click-function trigger
          setTimeout(() => {
            if (!handled) {
              resolve(null)
            }
          })
        })
        event.sender.once('context-menu', (_event, params) => {
          contextMenuParams = params
        })
        menu.popup()
      })
    })
  }

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

  async openCustom(
    name: string,
    filepath: string,
    opts: BrowserWindowConstructorOptions = {}
  ) {
    const window = new BrowserWindow({
      ...opts,
      webPreferences: {
        // This should be the default preload, which just adds the sideAPI to the window
        preload: join(__dirname, `project-editor-preload-bundle.js`),
        ...opts?.webPreferences ?? {},
      },
    })
    this.windows[name] = window
    await window.loadURL(`file://${filepath}`)
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
    window.webContents.setWindowOpenHandler((details) => {
      this.session.recorder.handleNewWindow(details)
      return {
        action: 'allow',
        overrideBrowserWindowOptions: playbackWindowOptions,
      }
    })

    window.webContents.on('did-create-window', (win) =>
      this.handlePlaybackWindow(win)
    )
    // This block listens for frames to be created
    // Upon being so, we check if our API is available
    // If not, we reload and check again until it is.
    // This is to overcome a quirk in Electron where
    // the preload scripts will sometimes just fail to register or something
    window.webContents.on('frame-created', async (_event, details) => {
      const frame = details.frame
      await frame.once('dom-ready', async () => {
        const hasAPI = await frame.executeJavaScript('window.sideAPI')
        if (!hasAPI) {
          frame.reload()
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
    window.on('closed', () => this.removePlaybackWIndow(window))
  }

  async removePlaybackWIndow(window: Electron.BrowserWindow) {
    this.playbackWindows.splice(this.playbackWindows.indexOf(window), 1)
    if (this.playbackWindows.length == 0) {
      if (this.session.state.state.status == 'recording') {
        await this.session.api.recorder.stop()
      } else {
        await this.session.api.playback.stop()
      }
    }
  }

  async onProjectLoaded() {
    await this.initializePlaybackWindow()
    await this.close('splash')

    await this.open(projectEditorWindowName)
    const projectWindow = await this.get(projectEditorWindowName)
    const size = storage.get<'windowSize'>('windowSize')
    const position = storage.get<'windowPosition'>('windowPosition')

    if (size.length) projectWindow.setSize(size[0], size[1], true)

    const screenElectron = electron.screen.getPrimaryDisplay()

    const sWidth = screenElectron.bounds.width
    const sHeight = screenElectron.bounds.height

    if (position.length) {
      const adjustedX = position[0] < 0 ? 50 : position[0]
      const adjustedY = position[1] < 0 ? 50 : position[1]
      projectWindow.setPosition(adjustedX, adjustedY)

      if (size.length) {
        const adjustedW =
          adjustedX + size[0] > sWidth ? sWidth - adjustedX - 50 : size[0]
        const adjustedH =
          adjustedY + size[1] > sHeight ? sHeight - adjustedY - 50 : size[1]
        projectWindow.setSize(adjustedW, adjustedH)
      }
    }

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
    this.playbackWindows.forEach((bw) => {
      this.removePlaybackWIndow(bw);
      bw.close();
    })
    await this.openPlaybackWindow()
  }

  async getPlaybackWindow() {
    return this.playbackWindows.slice(-1)[0]
  }
}
