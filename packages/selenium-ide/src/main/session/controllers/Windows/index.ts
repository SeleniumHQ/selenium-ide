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
import { isAutomated } from 'main/util'
import { join } from 'node:path'
import BaseController from '../Base'
import { window as playbackWindowOpts } from 'browser/windows/PlaybackWindow/controller'

const playbackWindowName = 'playback-window'
const playbackCSS = readFileSync(join(__dirname, 'highlight.css'), 'utf-8')
const playbackWindowOptions = {
  ...playbackWindowOpts(),
  webPreferences: {
    devTools: !isAutomated,
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
      const hasPreload = !filename.endsWith('-bidi') && existsSync(preloadPath)
      const windowLoader: WindowLoaderFactory =
        (_session: Session) =>
        (_options: BrowserWindowConstructorOptions = {}) => {
          const windowConfig = window()
          const options: Electron.BrowserWindowConstructorOptions = {
            ...windowConfig,
            ..._options,
            webPreferences: {
              devTools: !isAutomated,
              ...(windowConfig?.webPreferences ?? {}),
              preload: hasPreload ? preloadPath : undefined,
              sandbox: true,
              ...(_options.webPreferences ?? {}),
            },
          }
          const win = new BrowserWindow(options)
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

let partition = 1
export default class WindowsController extends BaseController {
  handlesToIDs: { [key: string]: number } = {}
  playbackWindows: BrowserWindow[] = []
  claimedPlaybackWindows: BrowserWindow[] = []
  windowLoaders: WindowLoaderMap = makeWindowLoaders(this.session)
  windows: { [key: string]: BrowserWindow } = {}

  constructor(session: Session) {
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
            click() {
              handled = true
              resolve({
                cmd,
                params: contextMenuParams,
              })
            },
          }
        })
        const menu = Menu.buildFromTemplate([
          {
            label: 'Selenium IDE',
            submenu: template,
          },
        ])
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
    await this.close('project-editor')
    await this.close('logger')
    await this.closeAllPlaybackWindows()
  }

  async closeAllPlaybackWindows(): Promise<void> {
    const playbackWindows = this.playbackWindows
    playbackWindows.forEach((window) => window.close())
    this.playbackWindows = []
  }

  get(name: string): BrowserWindow {
    return this.windows[name]
  }

  requestPlaybackWindow() {
    let availableWindow: BrowserWindow | null = null
    const activeWindow = this.getActivePlaybackWindow()
    const claimedWindows = this.claimedPlaybackWindows
    if (activeWindow && !claimedWindows.includes(activeWindow)) {
      availableWindow = activeWindow
    } else {
      const window = this.playbackWindows.find(
        (bw) => !claimedWindows.includes(bw)
      )
      if (window) {
        availableWindow = window
      }
    }
    if (availableWindow) {
      claimedWindows.push(availableWindow)
    }
    return availableWindow
  }

  async claimPlaybackWindow(window: BrowserWindow) {
    this.claimedPlaybackWindows.push(window)
  }

  async releasePlaybackWindow(window: BrowserWindow) {
    const index = this.claimedPlaybackWindows.indexOf(window)
    if (index !== -1) {
      this.claimedPlaybackWindows.splice(index, 1)
    }
  }

  getActivePlaybackWindow(): BrowserWindow | null {
    const windowCount = this.playbackWindows.length
    if (windowCount === 0) {
      return null
    }
    return this.playbackWindows.find((win) => win.isVisible()) ?? null
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
      delete this.windows[name]
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
        ...(opts?.webPreferences ?? {}),
      },
      show: false,
    })
    this.windows[name] = window
    await window.loadURL(`file://${filepath}`)
    await this.useWindowState(
      window,
      'windowSize' + name,
      'windowPosition' + name
    )
    window.show()
    return true
  }

  getPlaybackWindowByHandle(handle: string) {
    const id = this.handlesToIDs[handle]
    return this.playbackWindows.find((bw) => bw.id === id)
  }

  getPlaybackWindowHandleByID(id: number) {
    const handle = Object.entries(this.handlesToIDs).find(
      ([_, value]) => value === id
    )?.[0]
    return handle
  }

  async closePlaybackWindow(id: number) {
    const activePlaybackWindow = this.getActivePlaybackWindow()
    const window = BrowserWindow.fromId(id)
    const isActive = window === activePlaybackWindow
    window!.close()

    if (isActive) {
      const newActiveWindow = this.playbackWindows.find((w) => w.id !== id)
      if (newActiveWindow) {
        this.session.api.windows.focusPlaybackWindow(newActiveWindow.id)
      }
    }
  }

  async focusPlaybackWindow(id: number) {
    const window = await BrowserWindow.fromId(id)
    this.playbackWindows.forEach((bw) => {
      if (bw !== window) {
        bw.hide()
      } else {
        bw.showInactive()
      }
    })
  }

  async openPlaybackWindow(opts: BrowserWindowConstructorOptions = {}) {
    const playbackPanel =
      await this.session.resizablePanels.getPlaybackWindowDimensions()
    const playingSuite = this.session.playback.playingSuite
    const persistSession = playingSuite ?
      this.session.projects.project.suites.find(s => s.id === playingSuite)?.persistSession :
      false
    const correctedDims = await this.calculateScaleAndZoom(...playbackPanel.size)
    const window = this.windowLoaders[playbackWindowName]({
      ...opts,
      x: playbackPanel.position[0],
      y: playbackPanel.position[1],
      width: correctedDims.width,
      height: correctedDims.height,
      parent: await this.session.windows.get(projectEditorWindowName),
      webPreferences: {
        partition: persistSession ? playingSuite : `playback-${partition++}`,
        zoomFactor: correctedDims.zoomFactor
      },
    })
    this.handlePlaybackWindow(window)
    window.showInactive()
    if (opts.title) {
      window.webContents.executeJavaScript(`document.title = "${opts.title}";`)
    }
    return window
  }

  async calculateScaleAndZoom(_targetWidth: number, _targetHeight: number) {
    const {
      state: {
        editor: { overrideWindowSize },
      },
    } = await this.session.state.get()
    const targetWidth = overrideWindowSize.active
      ? Math.max(overrideWindowSize.width, 150)
      : _targetWidth
    const targetHeight = overrideWindowSize.active
      ? Math.max(overrideWindowSize.height, 150)
      : _targetHeight

    const {
      size: [width, height],
    } = await this.session.resizablePanels.getPlaybackWindowDimensions()
    const xAspect = width / targetWidth
    const yAspect = height / targetHeight
    let resultWidth = targetWidth
    let resultHeight = targetHeight
    const zoomFactor = Math.min(xAspect, yAspect, 1)
    if (xAspect < 1 || yAspect < 1) {
      resultWidth = Math.round(targetWidth * zoomFactor)
      resultHeight = Math.round(targetHeight * zoomFactor)
    }
    return {
      width: resultWidth,
      height: resultHeight,
      zoomFactor,
    }
  }

  async resizePlaybackWindow(
    window: BrowserWindow,
    _targetWidth: number,
    _targetHeight: number
  ) {
    const { width, height, zoomFactor } = await this.calculateScaleAndZoom(
      _targetWidth,
      _targetHeight
    )
    window.setSize(width, height)
    window.webContents.setZoomFactor(zoomFactor)
  }

  async resizePlaybackWindows(_targetWidth: number, _targetHeight: number) {
    const { width, height, zoomFactor } = await this.calculateScaleAndZoom(
      _targetWidth,
      _targetHeight
    )
    this.playbackWindows.forEach((window) => {
      window.setSize(width, height)
      window.webContents.setZoomFactor(zoomFactor)
    })
  }

  async registerPlaybackWindowHandle(handle: string, id: number) {
    this.handlesToIDs[handle] = id
  }

  handlePlaybackWindow(window: BrowserWindow) {
    this.playbackWindows.push(window)
    window.webContents.insertCSS(playbackCSS)
    const windowDimensions =
      this.session.resizablePanels.cachedPlaybackWindowDimensions
    const dimensionOverrides = windowDimensions
      ? {
          x: windowDimensions.position[0],
          y: windowDimensions.position[1],
          width: windowDimensions.size[0],
          height: windowDimensions.size[1],
        }
      : {}
    this.session.api.windows.onPlaybackWindowOpened.dispatchEvent(window.id, {
      title: window.getTitle(),
    })
    window.webContents.setWindowOpenHandler(() => {
      const { position, size } =
        this.session.resizablePanels.cachedPlaybackWindowDimensions!
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          ...playbackWindowOptions,
          ...dimensionOverrides,
          parent: this.get(projectEditorWindowName),
          show: true,
          x: position[0],
          y: position[1],
          width: size[0],
          height: size[1],
        },
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

      this.session.api.windows.onPlaybackWindowChanged.dispatchEvent(
        window.id,
        {
          focused: true,
        }
      )
    })
    window.on('blur', () => {
      this.session.api.windows.onPlaybackWindowChanged.dispatchEvent(
        window.id,
        {
          focused: false,
        }
      )
    })
    window.webContents.on('did-navigate', () => {
      this.session.api.windows.onPlaybackWindowChanged.dispatchEvent(
        window.id,
        {
          title: window.webContents
            .getURL()
            .replace(this.session.projects.project.url, ''),
        }
      )
    })
    window.on('closed', () => {
      this.session.api.windows.onPlaybackWindowClosed.dispatchEvent(window.id)
      this.removePlaybackWIndow(window)
    })
  }

  async removePlaybackWIndow(window: Electron.BrowserWindow) {
    this.playbackWindows.splice(this.playbackWindows.indexOf(window), 1)
    if (this.playbackWindows.length === 0) {
      if (this.session.state.state.status === 'recording') {
        await this.session.api.recorder.stop()
      }
    }
  }

  async initializePlaybackWindow() {
    this.playbackWindows.forEach((bw) => {
      this.removePlaybackWIndow(bw)
      bw.close()
    })
  }

  arrangeWindow(
    window: Electron.BrowserWindow,
    sizeKey: string,
    positionKey: string
  ) {
    const size = this.session.store.get(sizeKey) as number[]
    const position = this.session.store.get(positionKey) as number[]
    if (size?.length) window.setSize(size[0], size[1])

    const screenElectron = electron.screen.getPrimaryDisplay()

    const sWidth = screenElectron.bounds.width
    const sHeight = screenElectron.bounds.height

    if (position?.length) {
      const adjustedX = position[0] < 0 ? 50 : position[0]
      const adjustedY = position[1] < 0 ? 50 : position[1]
      window.setPosition(adjustedX, adjustedY)

      if (size.length) {
        const adjustedW =
          adjustedX + size[0] > sWidth ? sWidth - adjustedX - 50 : size[0]
        const adjustedH =
          adjustedY + size[1] > sHeight ? sHeight - adjustedY - 50 : size[1]
        window.setSize(adjustedW, adjustedH)
      }
    }
  }

  useWindowState(
    window: Electron.BrowserWindow,
    sizeKey: string,
    positionKey: string
  ) {
    this.arrangeWindow(window, sizeKey, positionKey)
    const recalculateEverything = () => {
      const position = window.getPosition() as [number, number]
      this.session.store.set(positionKey as any, position)
      const size = window.getSize() as [number, number]
      this.session.store.set(sizeKey as any, size)
    }
    window.on('move', recalculateEverything)
    window.on('moved', recalculateEverything)
    window.on('resize', recalculateEverything)
    window.on('resized', recalculateEverything)
  }

  async onProjectLoaded() {
    await this.initializePlaybackWindow()
    await this.close('splash')

    await this.open(projectEditorWindowName, {
      show: false,
      title:
        'Project Editor: ' + this.session.projects?.filepath ??
        this.session.projects.project.name,
    })
    const projectWindow = await this.get(projectEditorWindowName)
    this.useWindowState(projectWindow, 'windowSize', 'windowPosition')
    projectWindow.on('move', () => {
      this.session.resizablePanels.recalculatePlaybackWindows()
    })
    projectWindow.on('resize', () => {
      this.session.resizablePanels.recalculatePlaybackWindows()
    })

    projectWindow.show()

    projectWindow.on('close', async (e) => {
      if (!this.session.system.isDown && !this.session.system.shuttingDown) {
        e.preventDefault()
        const confirm = await this.session.projects.onProjectUnloaded()
        if (confirm) {
          await projectWindow.destroy()
          await this.closeAll()
        }
      }
    })
  }

  async onProjectUnloaded() {
    this.closeAllPlaybackWindows()
  }
}
