const { spawn } = require('child_process')
const webdriver = require('selenium-webdriver')
const fs = require('fs')
const path = require('path')
const os = require('os')

const WebdriverDebugLog = console.log // debuglog('webdriver')

const driverPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'electron-chromedriver',
  'bin',
  'chromedriver' + (os.platform() === 'win32' ? '.exe' : '')
)

// Requiring electron returns the path to its executable and downloads it on
// first use
const getElectronPath = () => require('electron')

// Set IDE_BINARY to the executable of a packaged build to test it instead of
// the unpackaged app
const packagedBinaryPath = process.env.IDE_BINARY
const electronBinaryPath = packagedBinaryPath || getElectronPath()
const pathToSeleniumIDE = path.join(__dirname, '..', 'build', 'main-bundle.js')

const port = 9518
main()

// Reads the project and app state from the IDE window
let getSession

async function main() {
  console.log('Starting webdriver backend')
  console.log(`Using display [${process.env.DISPLAY || 'none'}] specified`)
  const { proc, success } = await startWebdriverBackend()
  if (!success) {
    console.error('Failed to start webdriver backend')
    console.error(proc.error)
    throw proc.error
  }
  let driver
  try {
    console.log('Instantiating IDE as driver process')
    driver = await new webdriver.Builder()
      .usingServer(`http://localhost:${port}`)
      .withCapabilities({
        'goog:chromeOptions': {
          // Here is the path to your Electron binary.
          binary: electronBinaryPath,
          args: [
            ...(packagedBinaryPath ? [] : ['app=' + pathToSeleniumIDE]),
            'enable-automation',
            // Ubuntu 24.04 and later block the Chromium sandbox for Electron
            ...(os.platform() === 'linux' ? ['no-sandbox'] : []),
          ],
          excludeSwitches: ['enable-logging'],
        },
      })
      .forBrowser('chrome')
      .build()
    console.log('IDE instantiated successfully!')
    getSession = () =>
      driver.executeAsyncScript(
        'const done = arguments[arguments.length - 1]; window.sideAPI.state.get().then(done)'
      )
    console.log('Starting new project...')
    const newProject = await driver.wait(
      webdriver.until.elementLocated(webdriver.By.css('[data-new-project]')),
      5000
    )
    const firstHandle = await driver.getWindowHandle()
    await newProject.click()
    let handles = await driver.getAllWindowHandles()
    while (handles.length < 1 || handles[0] === firstHandle) {
      await driver.sleep(100)
      try {
        handles = await driver.getAllWindowHandles()
      } catch (e) {
        // ignore
      }
    }
    await driver.switchTo().window(handles[0])
    console.log(
      'Project started successfully, IDE is ready to record commands!'
    )

    const testTab = await driver.wait(
      webdriver.until.elementLocated(webdriver.By.id('tab-0')),
      5000
    )
    await driver.wait(webdriver.until.elementIsVisible(testTab), 5000)
    try {
      await testTab.click()
    } catch (e) {
      // On Windows the tab can be covered while the window is still laying out
      await driver.executeScript('arguments[0].click()', testTab)
    }

    // Recording and playback both start from the test's first command, an
    // open command. Point it at the test site, like a user would.
    const firstCommand = await driver.wait(
      webdriver.until.elementLocated(webdriver.By.css('[data-command-id]')),
      5000
    )
    await firstCommand.click()
    const openTarget = await driver.wait(
      webdriver.until.elementLocated(webdriver.By.css('input[id^="target-"]')),
      5000
    )
    const selectAll = webdriver.Key.chord(
      os.platform() === 'darwin'
        ? webdriver.Key.COMMAND
        : webdriver.Key.CONTROL,
      'a'
    )
    await openTarget.sendKeys(selectAll, 'http://localhost:8080/')
    await driver.wait(async () => {
      const { project, state } = await getSession()
      const test = project.tests.find((t) => t.id === state.activeTestID)
      return test.commands[0].target === 'http://localhost:8080/'
    }, 5000)

    const record = await driver.wait(
      webdriver.until.elementLocated(webdriver.By.css('[data-record]')),
      5000
    )
    await record.click()

    let handles2 = await driver.getAllWindowHandles()
    while (handles2.length < 2) {
      await driver.sleep(100)
      handles2 = await driver.getAllWindowHandles()
    }
    await driver.switchTo().window(handles2[1])
    await driver.wait(
      webdriver.until.elementLocated(webdriver.By.linkText('windows.html')),
      20000
    )
    // The recorder attaches its listeners shortly after the page loads
    await driver.sleep(2000)
    await driver.wait(async () => {
      try {
        await driver.findElement(webdriver.By.linkText('windows.html')).click()
        return true
      } catch (e) {
        if (
          e.name === 'StaleElementReferenceError' ||
          e.name === 'NoSuchElementError'
        ) {
          return false
        }
        throw e
      }
    }, 10000)
    await driver.switchTo().window(handles2[0])
    const expected = 'Click linkText=windows.html'
    let text = ''
    await driver
      .wait(async () => {
        const commands = await driver.findElements(
          webdriver.By.css('[data-command-id]')
        )
        for (const command of commands) {
          text = (await command.getText()).replace(/\s+/g, ' ')
          // The row text can start with the command number
          if (text === expected || text.endsWith(' ' + expected)) {
            return true
          }
        }
        return false
      }, 5000)
      .catch(() => {
        throw new Error(
          'Expected a recorded command "' +
            expected +
            '", last command text: ' +
            text
        )
      })
    console.log('IDE is correctly recording commands!')

    // Stop recording and play the recorded test back
    await (
      await driver.findElement(webdriver.By.css('button[aria-label="stop"]'))
    ).click()
    await driver.wait(
      async () => (await getSession()).state.status === 'idle',
      10000
    )
    await (await driver.findElement(webdriver.By.css('[data-play]'))).click()
    let results = []
    await driver
      .wait(async () => {
        const { project, state } = await getSession()
        const test = project.tests.find((t) => t.id === state.activeTestID)
        results = test.commands.map((c) => [
          c.command + ' ' + c.target,
          (state.playback.commands[c.id] || {}).state,
        ])
        return (
          state.status === 'idle' &&
          results.every(([, result]) => result === 'passed')
        )
      }, 30000)
      .catch(() => {
        throw new Error('Playback did not pass: ' + JSON.stringify(results))
      })
    console.log('IDE is correctly playing back commands!')

    // The IDE gets Chrome and its driver with Selenium Manager
    const download = await driver.executeAsyncScript(
      "const done = arguments[arguments.length - 1]; window.sideAPI.driver.download({ browser: 'chrome', version: '' }).then(() => done(null), (e) => done(String(e)))"
    )
    if (download) {
      throw new Error('Selenium Manager could not get Chrome: ' + download)
    }
    console.log('IDE got Chrome and its driver with Selenium Manager')
    await driver.quit()
    proc.kill()
  } catch (e) {
    if (driver) {
      await driver.quit()
    }
    proc.kill()
    throw e
  }
}

function startWebdriverBackend() {
  const successMessage = 'was started successfully'
  return new Promise((resolve) => {
    let initialized = false
    const args = ['--verbose', `--port=${port}`]
    if (fs.existsSync(driverPath)) {
      const proc = spawn(driverPath.replace(/\s/g, ' '), args, {
        env: { ...process.env },
        shell: false,
      })
      proc.stdout.on('data', (out) => {
        const outStr = `${out}`
        WebdriverDebugLog(outStr)
        const fullyStarted = outStr.includes(successMessage)
        if (fullyStarted) {
          initialized = true
          WebdriverDebugLog('Webdriver backend is ready!')
          resolve({ success: true, proc: proc })
        }
      })
      proc.stderr.on('data', (err) => {
        const errStr = `${err}`
        WebdriverDebugLog(errStr)
        if (!initialized) {
          resolve({ success: false, error: errStr })
        }
      })
      proc.on('close', (code) => {
        if (code) {
          WebdriverDebugLog(`driver has exited with code ${code}`)
          if (!initialized) {
            resolve({
              success: false,
              error: 'Process has exited before starting with code ' + code,
            })
          }
        }
      })
    } else {
      resolve({
        success: false,
        error: `Missing executable at path ${driverPath}`,
      })
    }
  })
}
