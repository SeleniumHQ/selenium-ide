import { WindowConfig } from 'browser/types'
import Electron from 'electron'

export const window: WindowConfig['window'] = () => {
  const display = Electron.screen.getPrimaryDisplay()
  return {
    x: 50,
    y: 50,
    width: display.bounds.width - 100,
    height: display.bounds.height - 100,
  }
}
