import webdriver, { Capabilities, WebDriver } from 'selenium-webdriver'
import { Session } from '../types/server'

interface DriverOptions<Cap extends Capabilities> {
  browser: 'chrome'
  capabilities: Cap
  server: string
}

interface DriverShape {
  build<Cap extends Capabilities, Driver extends WebDriver>(
    options: DriverOptions<Cap>
  ): Promise<Driver>
  session: Session
}

const buildDriver = (_session: Session): DriverShape => ({
  async build({
    browser = 'chrome',
    capabilities = {
      'goog:chromeOptions': {
        // connect to the served electron DevTools
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
