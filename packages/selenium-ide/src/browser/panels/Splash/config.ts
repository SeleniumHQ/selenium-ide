import { BrowserWindow } from 'electron'
import noop from 'lodash/fp/noop'
import path from 'path'

export const menus = noop
export const name = 'splash'
export const window = () => {
  const dist = __dirname
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(dist, 'splash-preload-bundle.js'),
    },
  })
  win.loadFile(path.join(dist, 'splash.html'))
  return win
}
