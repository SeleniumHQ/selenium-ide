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
  const { proc, success } = await startWebdriverBackend({ driver: 'chrome' })
  if (!success) {
    console.error('Failed to start webdriver backend')
    console.error(proc.error)
    throw proc.error
  }
  let driver
  try {
    driver = await new webdriver.Builder()
      .usingServer(`http://localhost:${port}`)
      .withCapabilities({
        'goog:chromeOptions': {
          // Here is the path to your Electron binary.
          binary: electronBinaryPath,
          args: ['app=' + pathToSeleniumIDE, 'enable-automation'],
          excludeSwitches: ['enable-logging'],
        },
      })
      .forBrowser('chrome')
      .build()
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
      } catch (e) {}
    }
    await driver.switchTo().window(handles[0])

    const projectTab = await driver.wait(
      webdriver.until.elementLocated(webdriver.By.id('tab-2')),
      5000
    )
    await projectTab.click()

    const url = await driver.wait(
      webdriver.until.elementLocated(webdriver.By.id('project-url')),
      5000
    )
    while ((await url.getAttribute('value')) !== '') {
      await url.sendKeys(webdriver.Key.BACK_SPACE)
    }
    await url.sendKeys('http://localhost:8080')
  
    const testTab = await driver.wait(
      webdriver.until.elementLocated(webdriver.By.id('tab-0')),
      5000
    )
    await testTab.click()

    const record = await driver.wait(
      webdriver.until.elementLocated(webdriver.By.css('[data-record]')),
      1000
    )
    await record.click()

    let handles2 = await driver.getAllWindowHandles()
    while (handles2.length < 2) {
      await driver.sleep(100)
      handles2 = await driver.getAllWindowHandles()
    }
    await driver.switchTo().window(handles2[1])
    await driver.sleep(1000)
    const link = await driver.wait(
      webdriver.until.elementLocated(webdriver.By.linkText('windows.html')),
      3000
    )
    await link.click()
    await driver.switchTo().window(handles2[0])
    const command = await driver.wait(
      webdriver.until.elementLocated(
        webdriver.By.css('[data-command-id]:nth-child(2)')
      ),
      1000
    )
    const text = (await command.getText()).replace(/\s+/g, ' ')
    if (text !== 'Click linkText=windows.html') {
      throw new Error('Unexpected command text: ' + text)
    }
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
        env: {},
        shell: false,
      })
      proc.stdout.on('data', (out) => {
        const outStr = `${out}`
        // WebdriverDebugLog(outStr)
        const fullyStarted = outStr.includes(successMessage)
        if (fullyStarted) {
          initialized = true
          WebdriverDebugLog('Driver has initialized!')
          resolve({ success: true, proc: proc })
        }
      })
      proc.stderr.on('data', (err) => {
        const errStr = `${err}`
        // WebdriverDebugLog(errStr)
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
