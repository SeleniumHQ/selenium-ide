const path = require('path')
const os = require('os')
const { spawn } = require('child_process')
const { app, BrowserWindow } = require('electron')
const webdriver = require('selenium-webdriver')
const { resolveDriverName } = require('@seleniumhq/get-driver')

app.commandLine.appendSwitch('remote-debugging-port', '8315')

app.on('ready', async () => {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 1460,
    height: 840,
    webPreferences: { nodeIntegration: true, webviewTag: true },
  })

  // and load the index.html of the app.
  win.loadFile(path.resolve(__dirname, '../renderer/index.html'))

  win.on('close', () => {
    win = null
  })

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  spawn(
    path
      .resolve(
        __dirname,
        '../../files',
        resolveDriverName({
          browser: 'electron',
          platform: os.platform(),
          version: process.versions.electron,
        })
      )
      .replace('app.asar', 'app.asar.unpacked')
  )

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

  await driver.executeScript(
    'document.getElementById("aut").src = "https://google.com"'
  )
})
