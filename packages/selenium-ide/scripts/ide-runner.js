const args = process.argv

const { spawn } = require('child_process')
const webdriver = require('selenium-webdriver')
const fs = require('fs')
const path = require('path')
const os = require('os')

const WebdriverDebugLog = console.log // debuglog('webdriver')

const appName = 'Electron'

const driverPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'electron-chromedriver',
  'bin',
  'chromedriver' + (os.platform() === 'win32' ? '.exe' : '')
)

const electronBinaryPath = path.join(
  require.resolve('electron'),
  '..',
  'dist',
  appName + '.app',
  'Contents',
  'MacOS',
  appName
)

const pathToSeleniumIDE = path.join(__dirname, '..', 'build', 'main-bundle.js')

const port = 9518
main()

async function main() {
  console.log('Starting webdriver backend')
  await startWebdriverBackend({ driver: 'chrome' })
  const sideFiles = args.filter((arg) => arg.endsWith('.side'))
  for (const sideFile of sideFiles) {
    console.log('Starting driver for sidefile', sideFile)
    const driver = await new webdriver.Builder()
      .usingServer(`http://localhost:${port}`)
      .withCapabilities({
        'goog:chromeOptions': {
          // Here is the path to your Electron binary.
          binary: electronBinaryPath,
          args: [
            'app=' + pathToSeleniumIDE,
            `side-file=./../../${sideFile.replace('./', '')}`,
          ],
        },
      })
      .forBrowser('chrome') // note: use .forBrowser('electron') for selenium-webdriver <= 3.6.0
      .build()
    await driver.sleep(10000)
    await driver.quit()
    return
  }
}

function startWebdriverBackend() {
  const successMessage = 'was started successfully.'
  return new Promise((resolve) => {
    let initialized = false
    const args = ['--verbose', `--port=${port}`]
    if (fs.existsSync(driverPath)) {
      const driver = spawn(driverPath.replace(/\s/g, ' '), args, {
        env: {},
        shell: false,
      })
      process.on('exit', () => {
        driver.kill()
      })
      driver.stdout.on('data', (out) => {
        const outStr = `${out}`
        WebdriverDebugLog(outStr)
        const fullyStarted = outStr.includes(successMessage)
        if (fullyStarted) {
          initialized = true
          WebdriverDebugLog('Driver has initialized!')
          resolve({ success: true, driver: driver })
        }
      })
      driver.stderr.on('data', (err) => {
        const errStr = `${err}`
        WebdriverDebugLog(errStr)
        if (!initialized) {
          resolve({ success: false, error: errStr })
        }
      })
      driver.on('close', (code) => {
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
