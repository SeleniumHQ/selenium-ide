import panelConfig from 'browser/helpers/panelConfig'
import { WindowConfig } from 'browser/types'
import Electron from 'electron'

export const window: WindowConfig['window'] = () => {
  const display = Electron.screen.getPrimaryDisplay()
  return {
    ...panelConfig,
    x: 10,
    y: Math.floor(display.bounds.height / 2 - 400),
    width: 200,
    height: 800,
    title: 'Test List',
  }
}
