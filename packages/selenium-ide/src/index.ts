import { app, BrowserWindow } from 'electron'
import path from 'path'
import seleniumIDEV3DistPath from '@seleniumhq/selenium-ide-v3-wrapper/constants/distPath'
import webdriver from 'selenium-webdriver'
import chromedriver from './chromedriver'
import loadAPI from './api/loadServer'
import { Config } from './types'

const pathToRenderer = require.resolve('@seleniumhq/selenium-ide-renderer')
app.commandLine.appendSwitch('remote-debugging-port', '8315')
app.on('ready', async () => {
  // Let chromedriver fully start up
  await chromedriver(app)
  // Make the main window
  let mainWindow: Electron.BrowserWindow = new BrowserWindow({
    width: 1460,
    height: 840,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'api', 'loadClient.js'),
    },
  })
  const config: Config = {
    app,
    window: mainWindow,
  }
  const api = await loadAPI(config)
  config.api = api
  // TODO: Install custom extensions before Selenium IDE v3
  // Install Selenium IDE v3 into the main window window
  // Load our main page
  const extension = await api.server.extensions.load(seleniumIDEV3DistPath)
  config.extension = extension
  mainWindow.loadFile(pathToRenderer)

  // Just a bit of focus passing
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  // Getting things in a row so that re-activating an app with no windows
  // on Darwin recreates the main window again
  mainWindow.on('close', () => {
    mainWindow = undefined
  })

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  const _driver = await new webdriver.Builder()
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
