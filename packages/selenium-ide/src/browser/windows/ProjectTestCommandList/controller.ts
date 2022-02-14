import panelConfig from 'browser/helpers/panelConfig'
import { WindowConfig } from 'browser/types'
import Electron from 'electron'

export const window: WindowConfig['window'] = () => {
  const display = Electron.screen.getPrimaryDisplay()
  return {
    ...panelConfig,
    focusable: true,
    x: display.bounds.width - 500,
    y: Math.floor(display.bounds.height / 2 - 310),
    width: 500,
    height: 600,
    title: 'Command List',
  }
}
