// import { Chrome } from '@seleniumhq/browser-info'
import { WebDriverExecutor } from '@seleniumhq/side-runtime'
import { ChildProcess } from 'child_process'
import { BrowserInfo, Session } from 'main/types'
import downloadDriver from './download'
import startDriver from './start'

// Escape hatch to avoid dealing with rootDir complexities in TS
// https://stackoverflow.com/questions/50822310/how-to-import-package-json-in-typescript
const ElectronVersion = require('electron/package.json').version

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
  // @ts-expect-error
  driver: WebDriverExecutor
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
  }: DriverOptions) {
    this.driver = new WebDriverExecutor({
      capabilities: {
        browserName: browser === 'electron' ? 'chrome' : browser,
        ...capabilities,
      },
      customCommands: this.session.commands.customCommands,
      hooks: {
        onBeforePlay: async () => this.onPlaybackStart(),
      },
      server,
      windowAPI: {
        setWindowSize: async (_executor, width, height) => {
          const window = this.session.windows.getLastPlaybackWindow()
          const bounds = await window.getBounds()
          await window.setBounds({
            x: bounds.x + Math.floor(bounds.width / 2) - Math.floor(width / 2),
            y:
              bounds.y + Math.floor(bounds.height / 2) - Math.floor(height / 2),
            height,
            width,
          })
        },
      },
    })
  }
  async onPlaybackStart() {
    const playbackWindow = await this.session.windows.get('playback-window')
    // Figure out playback window from document.title
    if (!this.windowHandle) {
      const webdriver = this.driver.driver
      const handles = await webdriver.getAllWindowHandles()
      for (let i = 0, ii = handles.length; i !== ii; i++) {
        await webdriver.switchTo().window(handles[i])
        const title = await webdriver.getTitle()
        const url = await webdriver.getCurrentUrl()
        if (
          title === playbackWindow.getTitle() &&
          url === playbackWindow.webContents.getURL()
        ) {
          this.windowHandle = handles[i]
          break
        }
      }
    } else {
      this.driver.driver.switchTo().window(this.windowHandle)
    }
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
