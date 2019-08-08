const { app, BrowserWindow } = require('electron')
const webdriver = require('selenium-webdriver')
const chromedriver = require('chromedriver')

app.commandLine.appendSwitch('remote-debugging-port', '8315')

app.on('ready', async () => {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 1460,
    height: 840,
    webPreferences: { nodeIntegration: true, webviewTag: true },
  })

  // and load the index.html of the app.
  win.loadFile(__dirname + '/index.html')

  chromedriver.start()

  const driver = new webdriver.Builder()
    // The "9515" is the port opened by chrome driver.
    .usingServer('http://localhost:9515')
    .withCapabilities({
      'goog:chromeOptions': {
        // connect to the served electron DevTools
        debuggerAddress: 'localhost:8315',
        windowTypes: ['webview'],
      },
    })
    .forBrowser('electron')
    .build()

  await driver.executeScript(
    'document.getElementById("aut").src = "https://google.com"'
  )
})
