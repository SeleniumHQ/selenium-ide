import 'v8-compile-cache'
import 'source-map-support/register'
import { app } from 'electron'
import { configureLogging, connectSessionLogging } from './log'
import store from './store'
import createSession from './session'
import installReactDevtools from './install-react-devtools'
import { isAutomated } from './util'

// Configure logging
configureLogging();

// Enable debugging - required for electron-chromedriver
app.commandLine.appendSwitch('remote-debugging-port', '8315')

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

// Instantiate the session
const session = createSession(app, store)
connectSessionLogging(session)

app.on('open-file', async (_e, path) => {
  await session.projects.load(path)
})

// Start and stop hooks
app.on('ready', async () => {
  if (!app.isPackaged && !isAutomated) {
    installReactDevtools()
  }
  await session.system.startup()

  process.on('SIGINT', async () => {
    await session.system.shutdown()
    if (session.system.isDown) {
      await session.system.quit()
    }
  })
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

app.on('before-quit', async () => {
  await session.system.beforeQuit()
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
