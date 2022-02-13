// import { Chrome } from '@seleniumhq/browser-info'
import { WebDriverExecutor } from '@seleniumhq/side-runtime'
import { version as ElectronVersion } from 'electron/package.json'
import { ChildProcess } from 'child_process'
import { BrowserInfo, Session } from 'main/types'
import downloadDriver from './download'
import startDriver from './start'

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
  }
  session: Session
  // @ts-expect-error
  driver: WebDriverExecutor
  driverProcess?: ChildProcess
  async build({
    browser = 'electron',
    capabilities = {
      'goog:chromeOptions': {
        debuggerAddress: 'localhost:8315',
        w3c: false,
      },
    },
    // The "9515" is the port opened by chrome driver.
    server = 'http://localhost:9515',
  }: DriverOptions) {
    this.driver = new WebDriverExecutor({
      capabilities: {
        browserName: browser === 'electron' ? 'chrome' : browser,
        ...capabilities,
      },
      server,
    })
    return this.driver
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
    const ourElectronBrowserInfo: BrowserInfo = {
      browser: 'electron',
      version: ElectronVersion,
    }
    return {
      browsers: [ourElectronBrowserInfo],
      selected: ourElectronBrowserInfo,
    }
  }
  async selectBrowser(selected: BrowserInfo): Promise<void> {
    this.session.store.set('browserInfo', selected)
  }
  async startProcess(info: BrowserInfo): Promise<null | string> {
    const results = await startDriver(this.session)(info)
    if (results.success) {
      this.driverProcess = results.driver
      return null
    }
    return results.error
  }
  async stopProcess(): Promise<null | string> {
    if (this.driverProcess) {
      this.driverProcess.kill()
    }
    return null
  }
}
