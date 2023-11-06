// import { Chrome } from '@seleniumhq/browser-info'
import { WebDriverExecutor } from '@seleniumhq/side-runtime'
import { ChildProcess } from 'child_process'
import { BrowserInfo, Session } from 'main/types'
import downloadDriver from './download'
import startDriver, { port, WebdriverDebugLog } from './start'
import BaseController from '../Base'

// Escape hatch to avoid dealing with rootDir complexities in TS
// https://stackoverflow.com/questions/50822310/how-to-import-package-json-in-typescript
const ElectronVersion = require('electron/package.json').version
const ourElectronBrowserInfo: BrowserInfo = {
  browser: 'electron',
  version: ElectronVersion,
}

type WindowType = 'webview'
interface DriverOptions {
  browser?: 'chrome' | 'electron' | 'firefox'
  capabilities?: {
    'goog:chromeOptions': {
      debuggerAddress?: string
      windowTypes?: WindowType[]
      w3c?: boolean
    }
  }
  server?: string
}

export interface BrowsersInfo {
  browsers: BrowserInfo[]
  selected: BrowserInfo
}

/**
 * This is a shameful controller truly. It is a wrapper on the side-runtime
 * WebdriverExecutor class, which is in itself a wrapper on an selenium-
 * webdriver. This is why, when mounted onto the session, we may have to
 * do this pattern of de-referencing (I'm sorry):
 *
 * this.session.driver.driver.driver
 *
 * :(
 */
export default class DriverController extends BaseController {
  constructor(session: Session) {
    super(session)
  }

  driverProcess?: ChildProcess
  windowHandle?: string

  async build({
    browser = 'electron',
    capabilities = {
      'goog:chromeOptions': {
        debuggerAddress: 'localhost:8315',
        w3c: true,
      },
    },
    // The "9515" is the port opened by chrome driver.
    server = 'http://localhost:' + port,
  }: DriverOptions): Promise<WebDriverExecutor> {
    const driver: WebDriverExecutor = new WebDriverExecutor({
      capabilities: {
        browserName: browser === 'electron' ? 'chrome' : browser,
        ...capabilities,
      },
      customCommands: this.session.commands.customCommands,
      disableCodeExportCompat:
        this.session.state.state.userPrefs.disableCodeExportCompat === 'Yes'
          ? true
          : false,
      hooks: {
        onBeforePlay: (v) => this.session.playback.onBeforePlay(v),
      },
      server,
      windowAPI: {
        setWindowSize: async (executor, width, height) => {
          const handle = await executor.driver.getWindowHandle()
          const window = await this.session.windows.getPlaybackWindowByHandle(handle)
          if (!window) {
            throw new Error('Failed to find playback window')
          }
          const pbWinCount = this.session.windows.playbackWindows.length
          const b = await window.getBounds()
          const calcNewX = b.x + Math.floor(b.width / 2) - Math.floor(width / 2)
          const calcNewY =
            b.y + Math.floor(b.height / 2) - Math.floor(height / 2)
          const newX = calcNewX < 0 ? pbWinCount * 20 : calcNewX
          const newY = calcNewY < 0 ? pbWinCount * 20 : calcNewY
          await window.setBounds({
            x: newX,
            y: newY,
            height,
            width,
          })
        },
      },
    })
    return driver
  }

  async download(info: BrowserInfo) {
    return downloadDriver(info)
  }

  async listBrowsers(): Promise<BrowsersInfo> {
    /*
     * Note: This is shelved for optimization but could be unearthed
     * if using browsers other than electron is valuable to people
     * const chromeBrowserInfo = await Chrome.getBrowserInfo()
     * const chromeBrowserInfoArr = Array.isArray(chromeBrowserInfo)
     *   ? chromeBrowserInfo
     *   : [chromeBrowserInfo]
     * const ourChromeBrowserInfo: BrowserInfo[] = chromeBrowserInfoArr.map(
     *   (info) => ({
     *     version: info.version,
     *     browser: 'chrome',
     *   })
     * )
     */
    return {
      browsers: [ourElectronBrowserInfo],
      selected: ourElectronBrowserInfo,
    }
  }

  async selectBrowser(
    selected: BrowserInfo = ourElectronBrowserInfo
  ): Promise<void> {
    this.session.store.set('browserInfo', selected)
  }

  async startProcess(
    info: BrowserInfo = ourElectronBrowserInfo
  ): Promise<null | string> {
    const results = await startDriver(this.session)(info)
    if (results.success) {
      this.driverProcess = results.driver
      return null
    }
    console.error('Failed to start chromedriver process', results.error)
    return results.error
  }

  async stopProcess(): Promise<null | string> {
    if (this.driverProcess) {
      const procKilled = await this.driverProcess.kill(9)
      WebdriverDebugLog('Killed driver?', procKilled)
    }
    return null
  }
}
