import 'v8-compile-cache'
import 'source-map-support/register'
import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import { configureLogging, connectSessionLogging } from './log'
import createSession from './session'
import installReactDevtools from './install-react-devtools'
import { isAutomated } from './util'

// Playback attaches chromedriver to this port to control the IDE's windows.
// Any local process can use it too; the README explains this to users.
app.commandLine.appendSwitch('remote-debugging-port', '8315')
// When the app is started with --enable-automation (as chromedriver does in
// scripts/ide-runner.js), turn off the GPU and the Chromium sandbox on every
// platform. CI runners and Ubuntu 24.04+ don't allow the sandbox.
if (isAutomated) {
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('no-sandbox');
}
// Configure logging
const log = configureLogging()
autoUpdater.logger = log

// Capture and show unhandled exceptions
process.on('unhandledRejection', function handleWarning(reason) {
  console.log('[PROCESS] Unhandled Promise Rejection')
  console.log('- - - - - - - - - - - - - - - - - - -')
  console.log(reason)
  console.log('- -')
})

process.on('uncaughtException', (error) => {
  console.error('Unhandled Error', error)
})

// Start and stop hooks
app.on('ready', async () => {
  if (!app.isPackaged && !isAutomated) {
    installReactDevtools()
  }
  const session = await createSession(app)
  connectSessionLogging(session)
  await session.system.startup()

  process.on('SIGINT', () => app.quit())
  app.on('open-file', async (_e, path) => {
    // Instantiate the session
    await session.projects.load(path)
  })

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  let allWindowsClosed = false

  app.on('activate', async () => {
    if (allWindowsClosed) {
      allWindowsClosed = false
      await session.system.startup()
    }
  })

  app.on('before-quit', async (e) => {
    e.preventDefault()
    const successfulExit = await session.system.beforeQuit()
    if (successfulExit) {
      app.exit(0)
    }
  })

  app.on('window-all-closed', async () => {
    allWindowsClosed = true
    if (process.platform === 'darwin') {
      await session.system.shutdown()
    } else {
      await session.system.quit()
    }
  })

  app.on(
    'certificate-error',
    (event, _webContents, _url, _error, _certificate, callback) => {
      session.state.getUserPrefs().then((userPrefs) => {
        console.log(userPrefs)
        if (
          userPrefs.ignoreCertificateErrorsPref === 'Yes' &&
          _url.startsWith(session.projects.project.url)
        ) {
          event.preventDefault()
          callback(true)
        } else callback(false)
      })
    }
  )
})
