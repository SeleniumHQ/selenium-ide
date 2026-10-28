// Starts the IDE the way a user does (without --enable-automation) and waits
// until the app has started its own playback driver. ide-runner.js can't
// check this, because the app skips that step under automation.
//
// Set IDE_BINARY to the executable of a packaged build to check it instead of
// the unpackaged app.
const { spawn } = require('child_process')
const os = require('os')
const path = require('path')

const readyMessage = 'Driver has initialized!'
const timeout = 60000

const packagedBinaryPath = process.env.IDE_BINARY
const command = packagedBinaryPath || require('electron')
const args = [
  ...(packagedBinaryPath
    ? []
    : [path.join(__dirname, '..', 'build', 'main-bundle.js')]),
  // Ubuntu 24.04 and later block the Chromium sandbox for Electron
  ...(os.platform() === 'linux' ? ['--no-sandbox'] : []),
]

console.log('Starting', command, args.join(' '))
const app = spawn(command, args, {
  // The unpackaged app logs the driver output only with NODE_DEBUG
  env: { ...process.env, NODE_DEBUG: 'webdriver' },
})

let output = ''
const finish = (code, message) => {
  clearTimeout(timer)
  console.log(message)
  app.kill()
  process.exit(code)
}
const onData = (data) => {
  output += data
  if (output.includes(readyMessage)) {
    finish(0, 'The IDE started its playback driver')
  }
}
app.stdout.on('data', onData)
app.stderr.on('data', onData)
app.on('exit', (code) => {
  console.log(output)
  finish(1, `The IDE exited with code ${code} before the driver started`)
})
const timer = setTimeout(() => {
  console.log(output)
  finish(1, `The IDE did not start its playback driver in ${timeout / 1000}s`)
}, timeout)
