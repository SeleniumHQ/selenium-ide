import webdriver from 'selenium-webdriver'

export default async function buildDriver() {
  return await new webdriver.Builder()
    // The "9515" is the port opened by chrome driver.
    .usingServer('http://localhost:9515')
    .withCapabilities({
      'goog:chromeOptions': {
        // connect to the served electron DevTools
        debuggerAddress: 'localhost:8315',
      },
    })
    .forBrowser('chrome')
    .build()
}
