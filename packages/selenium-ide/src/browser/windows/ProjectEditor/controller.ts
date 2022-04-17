import panelConfig from 'browser/helpers/panelConfig'
import { WindowConfig } from 'browser/types'
import Electron from 'electron'

const width = 550
export const window: WindowConfig['window'] = () => {
  const display = Electron.screen.getPrimaryDisplay()
  return {
    ...panelConfig,
    frame: true,
    focusable: true,
    resizable: true,
    x: display.bounds.width - width,
    y: 20,
    width,
    height: display.bounds.height - 200,
    title: 'Command List',
  }
}
