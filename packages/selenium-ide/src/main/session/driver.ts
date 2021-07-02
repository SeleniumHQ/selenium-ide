import webdriver, { WebDriver, Options } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'
import { Session } from '../types'

interface DriverOptions {
  browser?: 'chrome'
  capabilities?: Options & { 'goog:chromeOptions': chrome.Options }
  server?: string
}

interface DriverShape {
  build(options: DriverOptions): Promise<WebDriver>
}

const buildDriver = (_session: Session): DriverShape => ({
  async build({
    browser = 'chrome',
    capabilities = {
      'goog:chromeOptions': {
        debuggerAddress: 'localhost:8315',
      },
    },
    // The "9515" is the port opened by chrome driver.
    server = 'http://localhost:9515',
  }) {
    const driver = await new webdriver.Builder()
      .usingServer(server)
      .withCapabilities(capabilities)
      .forBrowser(browser)
      .build()
    return driver
  },
})

export type Driver = ReturnType<typeof buildDriver>
export default buildDriver
