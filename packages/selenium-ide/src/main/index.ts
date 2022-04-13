import 'v8-compile-cache'
import { app, BrowserWindow, MenuItemConstructorOptions } from 'electron'
import contextMenu from 'electron-context-menu'
import store from './store'
import createSession from './session'

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

// Enable local debugging
app.commandLine.appendSwitch('remote-debugging-port', '8315')

const session = createSession(app, store)

contextMenu({
  prepend: (defaultActions, _parameters, browserWindow, _event) => {
    const actions: MenuItemConstructorOptions[] = []
    const win = browserWindow as BrowserWindow
    if (session.windows.playbackWindows.includes(win)) {
      actions.push(defaultActions.inspect())
      return actions
    }
    return actions
  },
  showLookUpSelection: false,
  showInspectElement: false,
  showSearchWithGoogle: false,
})

app.on('ready', session.wake)
app.on('before-quit', session.sleep)

// Respect the OSX convention of having the application in memory even
// after all windows have been closed

let allWindowsClosed = false
app.on('window-all-closed', () => {
  allWindowsClosed = true
  session.sleep()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', async () => {
  if (allWindowsClosed) {
    allWindowsClosed = false
    session.wake()
  }
})
