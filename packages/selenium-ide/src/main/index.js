const path = require('path')
const { app, BrowserWindow } = require('electron')
const webdriver = require('selenium-webdriver')
const chromedriver = require('./chromedriver')

app.commandLine.appendSwitch('remote-debugging-port', '8315')

app.on('ready', async () => {
  // Let chromdriver fully start up
  await chromedriver()

  // Create the browser window.
  let recordedWindow = new BrowserWindow({
    width: 1460,
    height: 840,
    webPreferences: { nodeIntegration: true, webviewTag: true },
  })

  // Inject v3 of Selenium IDE into this thing
  injectSeleniumIDEV3(win)

  const pathToRenderer = require.resolve('@seleniumhq/selenium-ide-renderer')
  // and load the index.html of the app.
  recordedWindow.loadFile(pathToRenderer)
  recordedWindow.on('ready-to-show', () => {
    recordedWindow.show()
    recordedWindow.focus()
  })
  recordedWindow.on('close', () => {
    recordedWindow = null
  })

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  const driver = await new webdriver.Builder()
    // The "9515" is the port opened by chrome driver.
    .usingServer('http://localhost:9515')
    .withCapabilities({
      'goog:chromeOptions': {
        // connect to the served electron DevTools
        debuggerAddress: 'localhost:8315',
        windowTypes: ['webview'],
      },
    })
    .forBrowser('chrome')
    .build()
})
