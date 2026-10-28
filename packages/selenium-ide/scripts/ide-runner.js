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

const getElectronPath = () => {
  const basePath = path.join(require.resolve('electron'), '..', 'dist')
  switch (os.platform()) {
    case 'darwin':
      return path.join(
        basePath,
        'Electron.app',
        'Contents',
        'MacOS',
        'Electron'
      )
    case 'win32':
      return path.join(basePath, 'electron.exe')
    default:
      return path.join(basePath, 'electron')
  }
}

const electronBinaryPath = getElectronPath()
const pathToSeleniumIDE = path.join(__dirname, '..', 'build', 'main-bundle.js')

const port = 9518
main()

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
            'app=' + pathToSeleniumIDE,
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
    await testTab.click()

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
    // The recorder opens the project URL first. Wait until it has left the
    // internal playback page, so it doesn't replace the page we open next.
    await driver.switchTo().window(handles2[1])
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl()
      return !url.startsWith('file:') && url !== 'about:blank'
    }, 15000)
    // Open the test site from the IDE's URL bar, like a user would
    await driver.switchTo().window(handles2[0])
    const urlBar = await driver.wait(
      webdriver.until.elementLocated(webdriver.By.css('input[data-url]')),
      5000
    )
    await urlBar.clear()
    await urlBar.sendKeys('http://localhost:8080/', webdriver.Key.ENTER)
    await driver.switchTo().window(handles2[1])
    await driver.wait(
      webdriver.until.elementLocated(webdriver.By.linkText('windows.html')),
      10000
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
          if (text === expected) {
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
  const successMessage = 'was started successfully.'
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
