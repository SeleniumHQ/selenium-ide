import 'v8-compile-cache'
import 'source-map-support/register'
import { app } from 'electron'
import store from './store'
import createSession from './session'
import installReactDevtools from './install-react-devtools'

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

// Start and stop hooks
app.on('ready', () => {
  !app.isPackaged && installReactDevtools()
  session.system.startup()
})
app.on('before-quit', () => session.system.shutdown())

// Respect the OSX convention of having the application in memory even
// after all windows have been closed
let allWindowsClosed = false
app.on('activate', async () => {
  if (allWindowsClosed) {
    allWindowsClosed = false
    session.system.startup()
  }
})
app.on('window-all-closed', () => {
  allWindowsClosed = true
  session.system.shutdown()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
