import { Chrome } from '@seleniumhq/browser-info'
import { WebDriverExecutor } from '@seleniumhq/side-runtime'
import { ChildProcess } from 'child_process'
import { readFileSync } from 'fs'
import { BrowserInfo, Session } from 'main/types'
import { join } from 'path'
import getScriptManager from 'selenium-webdriver/bidi/scriptManager'
import { Builder } from 'selenium-webdriver'
import downloadDriver from './download'
import startDriver, { port, WebdriverDebugLog } from './start'
import BaseController from '../Base'

const useBidi = false

const playbackWindowPreload = readFileSync(
  join(__dirname, `playback-window-preload-bundle.js`),
  'utf-8'
)

// Escape hatch to avoid dealing with rootDir complexities in TS
// https://stackoverflow.com/questions/50822310/how-to-import-package-json-in-typescript
const ElectronVersion = require('electron/package.json').version
const ourElectronBrowserInfo: BrowserInfo = {
  browser: 'electron',
  version: ElectronVersion,
}

type WindowType = 'webview'

interface DriverOptions {
  browser?: 'chrome' | 'electron' | 'firefox' | 'MicrosoftEdge'
  capabilities?: Record<string, unknown> & {
    'goog:chromeOptions'?: {
      debuggerAddress?: string
      windowTypes?: WindowType[]
      w3c?: boolean
    }
    webSocketUrl?: boolean
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
      webSocketUrl: useBidi,
    },
    // The "9515" is the port opened by chrome driver.
    server = 'http://localhost:' + port,
  }: DriverOptions): Promise<WebDriverExecutor> {
    console.info('Building driver for ' + browser)
    const browserName = browser === 'electron' ? 'chrome' : browser
    const driverBuilder = await new Builder()
      .withCapabilities({
        browserName,
        ...capabilities,
      })
      .usingServer(server)
      .forBrowser(browserName)
    console.info('Built driver for ' + browser)
    const driver = driverBuilder.build()
    if (useBidi) {
      console.info('Adding preload script to driver for ' + browser)
      const scriptManager = await getScriptManager(
        'selenium-ide',
        driver as any
      )
      await scriptManager.addPreloadScript(
        playbackWindowPreload as any,
        [],
        'false' as any
      )
      console.info('Added preload script to driver for ' + browser)
    }
    const executor: WebDriverExecutor = new WebDriverExecutor({
      customCommands: this.session.commands.customCommands,
      disableCodeExportCompat:
        this.session.state.state.userPrefs.disableCodeExportCompat === 'Yes'
          ? true
          : false,
      driver,
      hooks: {
        onBeforePlay: (v) => this.session.playback.onBeforePlay(v),
      },
      windowAPI: {
        setWindowSize: async (executor, width, height) => {
          const handle = await executor.driver.getWindowHandle()
          const window = await this.session.windows.getPlaybackWindowByHandle(
            handle
          )
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
    return executor
  }

  async download(info: BrowserInfo) {
    await downloadDriver(info)
  }

  async listBrowsers(): Promise<BrowsersInfo> {
    /*
     * Note: This is shelved for optimization but could be unearthed
     * if using browsers other than electron is valuable to people
     */
    const chromeBrowserInfo = await Chrome.getBrowserInfo()
    const chromeBrowserInfoArr = Array.isArray(chromeBrowserInfo)
      ? chromeBrowserInfo
      : [chromeBrowserInfo]
    const ourChromeBrowserInfo: BrowserInfo[] = chromeBrowserInfoArr.map(
      (info) => ({
        version: info.version,
        browser: 'chrome',
      })
    )
    return {
      browsers: [ourElectronBrowserInfo].concat(ourChromeBrowserInfo),
      selected: this.session.store.get('browserInfo') || ourElectronBrowserInfo,
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
      const browser = this.session.store.get('browserInfo')?.browser ?? 'electron';
      console.log('Stopping process for driver', browser)
      const procKilled = await this.driverProcess.kill(9)
      WebdriverDebugLog('Killed driver?', procKilled)
    }
    return null
  }

  async takeScreenshot(): Promise<string> {
    const driver = this.session.playback.playbacks?.[0]?.executor?.driver
    if (driver) return await driver.takeScreenshot()
    return ''
  }
}
