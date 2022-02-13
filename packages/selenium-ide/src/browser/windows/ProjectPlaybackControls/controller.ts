import panelConfig from 'browser/helpers/panelConfig'
import { WindowConfig } from 'browser/types'
import Electron from 'electron'

export const window: WindowConfig['window'] = () => {
  const display = Electron.screen.getPrimaryDisplay()
  return {
    ...panelConfig,
    x: Math.floor(display.bounds.width / 2 - 200),
    y: 10,
    width: 400,
    height: 38,
    title: 'Playback Controls',
  }
}
