import { Chrome } from '@seleniumhq/browser-info'
import { retry } from '@seleniumhq/side-commons'
import { CommandShape } from '@seleniumhq/side-model'
import { PluginRuntimeShape, WebDriverExecutor } from '@seleniumhq/side-runtime'
import { absolutifyUrl } from '@seleniumhq/side-runtime/dist/utils'
import { interpolateString } from '@seleniumhq/side-runtime/dist/preprocessors'
import { ChildProcess } from 'child_process'
import { BrowserInfo, Session } from 'main/types'
import { join } from 'path'
import { Builder } from 'selenium-webdriver'
import getScriptManager from 'selenium-webdriver/bidi/scriptManager'

import downloadDriver from './download'
import startDriver, { port, WebdriverDebugLog } from './start'
import BaseController from '../Base'
import { createBidiAPIBindings } from './bidi'

const turtlesMode = Boolean(process.env.TURTLES)
const pathToSeleniumIDE = join(__dirname, '..', 'build', 'main-bundle.js')
const ideCapabilities = {
  'goog:chromeOptions': {
    // Here is the path to your Electron binary.
    binary: process.execPath,
    args: ['app=' + pathToSeleniumIDE],
    excludeSwitches: ['enable-logging'],
  },
}

// Escape hatch to avoid dealing with rootDir complexities in TS
// https://stackoverflow.com/questions/50822310/how-to-import-package-json-in-typescript
const ElectronVersion = require('electron/package.json').version
const ourElectronBrowserInfo: BrowserInfo = {
  browser: 'electron',
  useBidi: false,
  version: ElectronVersion,
}
const electronCapabilities = {
  'goog:chromeOptions': {
    debuggerAddress: 'localhost:8315',
    w3c: true,
  },
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

const promptInitiators = (session: Session) =>
  Object.fromEntries(
    ['clickAt', 'click', 'sendKeys', 'select', 'submit'].map((commandName) => [
      commandName,
      {
        execute: (command: CommandShape, executor: WebDriverExecutor) =>
          new Promise<void>((resolve, reject) => {
            const origCommandName = executor.nameTransform(commandName)
            const checkForBlockingDialog = () => {
              if (session.polyfill.hasBlockingDialog()) {
                resolve()
              } else {
                setTimeout(checkForBlockingDialog, 100)
              }
            }
            // @ts-expect-error - I still need to pattern the index key to 'do*'
            executor[origCommandName](command.target, command.value, command)
              .then(resolve)
              .catch(reject)
            checkForBlockingDialog()
          }),
        name: commandName,
        description: 'Wrapped command to handle electron prompts',
      },
    ])
  )

const electronPolyfills = (
  session: Session
): PluginRuntimeShape['commands'] => ({
  ...promptInitiators(session),
  acceptAlert: {
    execute: async () => {
      await session.polyfill.alert.resolve!()
    },
    name: 'acceptAlert',
    description: 'Accepts an alert',
  },
  assertAlert: {
    execute: async (command: CommandShape) => {
      const expectedAlert = command.target
      const actualAlert = session.polyfill.alert.alert
      if (expectedAlert !== actualAlert) {
        throw new Error(
          `Alert assertion failed. Expected "${expectedAlert}", but got "${actualAlert}"`
        )
      }
    },
    name: 'assertAlert',
    description: 'Asserts that an alert has been shown with the given message',
  },
  acceptConfirmation: {
    execute: async () => {
      await session.polyfill.confirm.resolve!(true)
    },
    name: 'acceptConfirmation',
    description: 'Accepts a confirmation',
  },
  assertConfirmation: {
    execute: async (command: CommandShape) => {
      const expectedConfirmation = command.target
      const actualConfirmation = session.polyfill.confirm.confirm
      if (expectedConfirmation !== actualConfirmation) {
        throw new Error(
          `Confirmation assertion failed. Expected "${expectedConfirmation}", but got "${actualConfirmation}"`
        )
      }
    },
    name: 'assertConfirmation',
    description:
      'Asserts that a confirmation has been shown with the given message',
  },
  dismissConfirmation: {
    execute: async () => {
      session.polyfill.confirm.resolve!(false)
    },
    name: 'dismissConfirmation',
    description: 'Dismisses a confirmation',
  },
  answerPrompt: {
    execute: async (command: CommandShape) => {
      session.polyfill.prompt.resolve!(command.target || '')
    },
    name: 'answerPrompt',
    description: 'Answers a prompt with the given message',
  },
  assertPrompt: {
    execute: async (command: CommandShape) => {
      const expectedPromptQuestion = command.target
      const actualPromptQuestion = session.polyfill.prompt.question
      if (expectedPromptQuestion !== actualPromptQuestion) {
        throw new Error(
          `Prompt assertion failed. Expected "${expectedPromptQuestion}", but got "${actualPromptQuestion}"`
        )
      }
    },
    name: 'assertPrompt',
    description: 'Asserts that a prompt has been shown with the given message',
  },
  dismissPrompt: {
    execute: async () => {
      session.polyfill.prompt.resolve!(null)
    },
    name: 'dismissPrompt',
    description: 'Dismisses a prompt',
  },
  open: {
    execute: async (command: CommandShape, executor: WebDriverExecutor) => {
      const url = command.target
      const handle = await executor.driver.getWindowHandle()
      const window = await session.windows.getPlaybackWindowByHandle(handle)
      if (!window) {
        throw new Error('Failed to find playback window')
      }
      await retry(
        () =>
          window.loadURL(
            absolutifyUrl(
              interpolateString(url!, executor.variables),
              session.projects.project.url
            )
          ),
        5,
        100
      )
    },
    name: 'doOpen',
    description: 'Opens a URL',
  },
  setWindowSize: {
    execute: async (command: CommandShape, executor: WebDriverExecutor) => {
      const handle = await executor.driver.getWindowHandle()
      const window = await session.windows.getPlaybackWindowByHandle(handle)
      if (!window) {
        throw new Error('Failed to find playback window')
      }
      const [targetWidth, targetHeight] = command
        .target!.split('x')
        .map((v) => parseInt(v))
      await session.windows.resizePlaybackWindow(
        window,
        targetWidth,
        targetHeight
      )
    },
    name: 'setWindowSize',
    description: 'Sets the playback window size',
  },
})

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
  executor: WebDriverExecutor | null = null
  stopped = true
  scriptManager?: Awaited<ReturnType<typeof getScriptManager>>
  windowHandle?: string

  async build(
    {
      browser = this.session.store.get('browserInfo.browser') ?? 'electron',
      capabilities = {
        webSocketUrl: this.session.store.get('browserInfo.useBidi') ?? false,
      },
      // The "9515" is the port opened by chrome driver.
      server = 'http://localhost:' + port,
    }: DriverOptions = {
      browser: this.session.store.get('browserInfo.browser') ?? 'electron',
      capabilities: {
        webSocketUrl: this.session.store.get('browserInfo.useBidi') ?? false,
      },
    }
  ): Promise<WebDriverExecutor> {
    const browserName = browser === 'electron' ? 'chrome' : browser
    console.info('Instantiating driver builder for ', browser)
    const driverBuilder = await new Builder()
      .withCapabilities({
        browserName,
        ...capabilities,
        ...(capabilities.webSocketUrl === false ? electronCapabilities : {}),
        ...(turtlesMode ? ideCapabilities : {}),
      })
      .usingServer(server)
      .forBrowser(browserName)
    console.debug('Building driver for ' + browser)
    const driver = await retry(
      async () => {
        const result = await driverBuilder.build()
        console.info('Built driver for ' + browser)
        return result
      },
      3,
      100
    )
    console.debug('Built driver for ' + browser)
    const useBidi = await this.session.store.get('browserInfo.useBidi')
    if (useBidi) {
      createBidiAPIBindings(this.session, driver)
    }
    const browserPolyfills =
      browser !== 'electron' ? {} : electronPolyfills(this.session)
    const executor: WebDriverExecutor = new WebDriverExecutor({
      customCommands: {
        ...browserPolyfills,
        ...this.session.commands.customCommands,
      },
      disableCodeExportCompat:
        this.session.state.state.userPrefs.disableCodeExportCompat === 'Yes'
          ? true
          : false,
      driver,
      hooks: {
        onBeforePlay: (v) => this.session.playback.onBeforePlay(v),
      },
    })
    return executor
  }

  async getExecutor(): Promise<WebDriverExecutor> {
    if (this.executor) {
      try {
        await this.executor.driver.executeScript('return 1')
      } catch (e) {
        console.warn('Executor is dead. Rebuilding...')
        await this.executor.cleanup(false)
        this.executor = null
      }
    }
    if (!this.executor) {
      this.executor = await this.build()
    }
    return this.executor
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
        browser: 'chrome',
        version: info.version,
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
    this.session.windows.initializePlaybackWindow()
  }

  async startProcess(
    info: BrowserInfo = ourElectronBrowserInfo
  ): Promise<null | string> {
    this.stopped = false
    const results = await startDriver(this.session)(info)
    if (results.success) {
      this.driverProcess = results.driver
      return null
    }
    console.error('Failed to start chromedriver process', results.error)
    return results.error
  }

  async stopProcess(): Promise<null | string> {
    this.stopped = true
    await this.session.recorder.stop()
    await Promise.all(
      this.session.playback.playbacks.map((playback) => playback.cleanup())
    )
    await this.session.windows.closeAllPlaybackWindows()
    if (this.driverProcess) {
      const browser =
        this.session.store.get('browserInfo')?.browser ?? 'electron'
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
