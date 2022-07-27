// Shamelessly stolen from https://github.com/sindresorhus/electron-reloader

import chokidar from 'chokidar'
import { app, BrowserWindow } from 'electron'
import { join, sep } from 'path'
import { inspect } from 'util'

const root = join(__dirname, '..', '..', '..')

export default () => {
  let isRelaunching = false
  const watcher = chokidar.watch('packages/*/dist/**/*', {
    cwd: root,
    disableGlobbing: true,
    ignored: ['node_modules', '**/*.map'],
  })

  app.on('quit', watcher.close)

  watcher.on('ready', () =>
    console.log(
      'Watched paths:',
      inspect(watcher.getWatched(), { compact: false, colors: true })
    )
  )

  watcher.on('change', (filePath) => {
    console.log(`File changed: ${filePath} - ${new Date()}`)

    if (!filePath.includes(`${sep}browser${sep}`)) {
      if (!isRelaunching) {
        app.relaunch()
        app.exit(0)
      }
      isRelaunching = true
    } else {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.reloadIgnoringCache()

        for (const view of win.getBrowserViews()) {
          view.webContents.reloadIgnoringCache()
        }
      })
    }
  })
}
