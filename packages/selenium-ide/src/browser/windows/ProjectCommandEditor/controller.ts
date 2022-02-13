import panelConfig from 'browser/helpers/panelConfig'
import { WindowConfig } from 'browser/types'
import Electron from 'electron'

export const window: WindowConfig['window'] = () => {
  const display = Electron.screen.getPrimaryDisplay()
  return {
    ...panelConfig,
    x: Math.floor(display.bounds.width / 2 - 600),
    y: display.bounds.height - 210,
    width: 1200,
    height: 120,
    title: 'Command Editor',
  }
}
