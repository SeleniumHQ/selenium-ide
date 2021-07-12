import webdriver from 'selenium-webdriver'
import { Session } from '../../../types'

interface DriverOptions {
  browser?: 'chrome'
  capabilities?: {
    'goog:chromeOptions': {
      debuggerAddress: string
    }
  }
  server?: string
}

export default class DriverController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session
  async build({
    browser = 'chrome',
    capabilities = {
      'goog:chromeOptions': {
        debuggerAddress: 'localhost:8315',
      },
    },
    // The "9515" is the port opened by chrome driver.
    server = 'http://localhost:9515',
  }: DriverOptions) {
    const driver = await new webdriver.Builder()
      .usingServer(server)
      .withCapabilities(capabilities)
      .forBrowser(browser)
      .build()
    debugger
    return driver
  }
}
