import { BrowserWindow } from 'electron'
import noop from 'lodash/fp/noop'
import path from 'path'

export const menus = noop
export const name = 'projectEditor'
export const window = () => {
  const dist = __dirname
  const win = new BrowserWindow({
    x: 0,
    width: 500,
    height: 800,
    webPreferences: {
      preload: path.join(dist, 'project-editor-preload-bundle.js'),
    },
  })
  win.loadFile(path.join(dist, 'project-editor.html'))
  return win
}
