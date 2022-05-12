// import { Chrome } from '@seleniumhq/browser-info'
import { WebDriverExecutor } from '@seleniumhq/side-runtime'
import { ChildProcess } from 'child_process'
import { BrowserInfo, Session } from 'main/types'
import downloadDriver from './download'
import startDriver, { WebdriverDebugLog } from './start'

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

export default class DriverController {
  constructor(session: Session) {
    this.session = session
    this.build({})
  }

  session: Session
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
    server = 'http://localhost:9515',
  }: DriverOptions): Promise<WebDriverExecutor> {
    const driver: WebDriverExecutor = new WebDriverExecutor({
      capabilities: {
        browserName: browser === 'electron' ? 'chrome' : browser,
        ...capabilities,
      },
      customCommands: this.session.commands.customCommands,
      hooks: {
        onBeforePlay: (v) => this.session.playback.onBeforePlay(v),
      },
      server,
      windowAPI: {
        setWindowSize: async (_executor, width, height) => {
          const window = this.session.windows.getLastPlaybackWindow()
          const b = await window.getBounds()
          await window.setBounds({
            x: b.x + Math.floor(b.width / 2) - Math.floor(width / 2),
            y: b.y + Math.floor(b.height / 2) - Math.floor(height / 2),
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
    return results.error
  }

  async stopProcess(): Promise<null | string> {
    if (this.driverProcess) {
      let procKilled = this.driverProcess.kill()
      WebdriverDebugLog('Killed driver?', procKilled)
    }
    return null
  }
}
