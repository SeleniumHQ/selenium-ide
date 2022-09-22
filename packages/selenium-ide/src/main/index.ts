import 'v8-compile-cache'
import 'source-map-support/register'
import { app } from 'electron'
import log from 'electron-log'
import store from './store'
import createSession from './session'
import installReactDevtools from './install-react-devtools'
import { join } from 'path'

// Configure log file
const logFile = new Date().toISOString() + '.main.log'
log.transports.file.resolvePath = () => join(app.getPath('logs'), logFile)
Object.assign(console, log.functions);

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

app.on('open-file', async (_e, path) => {
  await session.projects.load(path)
})

// Start and stop hooks
app.on('ready', async () => {
  !app.isPackaged && installReactDevtools()
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

app.on('window-all-closed', async () => {
  allWindowsClosed = true
  await session.system.shutdown()
  if (process.platform !== 'darwin') {
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
