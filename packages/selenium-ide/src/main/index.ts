import { app, BrowserWindow } from 'electron'
import contextMenu from 'electron-context-menu'
import { MenuItemConstructorOptions } from 'electron/main'
import store from './store'
import createSession from './session'
import { Session } from './types'
import { ChildProcess } from 'child_process'

// Enable local debugging
app.commandLine.appendSwitch('remote-debugging-port', '8315')

let session: Session;
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

app.on('ready', async () => {
  session = await createSession(app, store)
})

app.on('before-quit', () => {
  console.log('Killing driver')
  const driverProcess = session.driver.driverProcess as ChildProcess
  driverProcess.kill()
})


let allWindowsClosed = false
// Respect the OSX convention of having the application in memory even
// after all windows have been closed
app.on('window-all-closed', () => {
  allWindowsClosed = true
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Getting things in a row so that re-activating an app with no windows
// on Darwin recreates the main window again
app.on('activate', async () => {
  if (allWindowsClosed) {
    allWindowsClosed = false
    session = await createSession(app, store)
  }
})
