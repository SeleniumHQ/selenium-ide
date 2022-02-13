import panelConfig from 'browser/helpers/panelConfig'
import { WindowConfig } from 'browser/types'
import Electron from 'electron'

export const window: WindowConfig['window'] = () => {
  const display = Electron.screen.getPrimaryDisplay()
  return {
    ...panelConfig,
    x: display.bounds.width - 500,
    y: Math.floor(display.bounds.height / 2 - 400),
    width: 500,
    height: 800,
    title: 'Command List',
  }
}
