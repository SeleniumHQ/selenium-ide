import { WindowConfig } from 'browser/types'
import Electron from 'electron'

const dimensions = {
  height: 200,
  width: 800,
}
export const window: WindowConfig['window'] = () => {
  const display = Electron.screen.getPrimaryDisplay()
  return {
    ...dimensions,
    x:
      Math.floor(display.bounds.width / 2) -
      Math.floor(dimensions.width / 2) -
      275,
    y:
      Math.floor(display.bounds.height) -
      Math.floor(dimensions.height) -
      50,
    title: 'Logs',
    webPreferences: {
      nodeIntegrationInSubFrames: true,
    }
  }
}
