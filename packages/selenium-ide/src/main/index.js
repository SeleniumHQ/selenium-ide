const { app, BrowserWindow } = require('electron')
const path = require('path')
const seleniumIDEV3DistPath = require('@seleniumhq/selenium-ide-v3-wrapper/constants/distPath')
const webdriver = require('selenium-webdriver')
const chromedriver = require('../chromedriver')
const initMainIPC = require('./IPCManager/main')
const addTab = require('./IPCManager/commands/addTab')

app.commandLine.appendSwitch('remote-debugging-port', '8315')

app.on('ready', async () => {
  // Let chromedriver fully start up
  await chromedriver(app)
  // Make the main window
  let mainWindow = new BrowserWindow({
    width: 1460,
    height: 840,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'IPCManager', 'preload.js'),
    },
  })
  // TODO: Install custom extensions before Selenium IDE v3
  // Install Selenium IDE v3 into the main window window
  const extension = await mainWindow.webContents.session.loadExtension(
    seleniumIDEV3DistPath
  )
  // Set up the IPC channels so that the client can make elevated permission
  // requests to Electron in a safe and controllable manner
  initMainIPC(mainWindow)
  // Render the tab management system
  const pathToRenderer = require.resolve('@seleniumhq/selenium-ide-renderer')
  mainWindow.loadFile(pathToRenderer)
  addTab(mainWindow, `${extension.url}/index.html`)

  // Just a bit of focus passing
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  // Getting things in a row so that re-activating an app with no windows
  // on Darwin recreates the main window again
  mainWindow.on('close', () => {
    mainWindow = null
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
