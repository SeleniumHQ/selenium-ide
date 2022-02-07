import { Chrome } from '@seleniumhq/browser-info'
import { WebDriverExecutor } from '@seleniumhq/side-runtime'
import { version as ElectronVersion } from 'electron/package.json';
import { ChildProcess } from 'child_process'
import { BrowserInfo, Session } from 'main/types'
import downloadDriver from './download'
import startDriver from './start'

interface DriverOptions {
  browser?: 'chrome' | 'electron' | 'firefox'
  capabilities?: {
    'goog:chromeOptions': {
      debuggerAddress?: string
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
    // capabilities = {
    //   'goog:chromeOptions': {
    //     debuggerAddress: 'localhost:6813',
    //     w3c: true,
    //   },
    // },
    // The "9515" is the port opened by chrome driver.
    server = 'http://localhost:9515',
  }: DriverOptions) {
    this.driver = new WebDriverExecutor({
      capabilities: { browserName: browser },
      server,
    })
    return this.driver
  }
  async download(version: string) {
    return downloadDriver(version)
  }
  async listBrowsers(): Promise<BrowsersInfo> {
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
    const ourElectronBrowserInfo: BrowserInfo = {
      browser: 'electron',
      version: ElectronVersion,
    }
    return {
      browsers: [ourElectronBrowserInfo].concat(ourChromeBrowserInfo),
      selected: this.session.store.get('browserInfo'),
    }
  }
  async selectBrowser(selected: BrowserInfo): Promise<void> {
    this.session.store.set('browserInfo', selected)
  }
  async startProcess(version: string): Promise<null | string> {
    const results = await startDriver(this.session)(version)
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
