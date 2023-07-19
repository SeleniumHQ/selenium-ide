import { WindowConfig } from 'browser/types'
import Electron from 'electron'

const dimensions = {
  height: 600,
  width: 800,
}
export const window: WindowConfig['window'] = (session) => {
  const display = Electron.screen.getPrimaryDisplay()
  return {
    ...dimensions,
    x:
      Math.floor(display.bounds.width / 2) -
      Math.floor(dimensions.width / 2) -
      275,
    y:
      Math.floor(display.bounds.height / 2) -
      Math.floor(dimensions.height / 2) -
      50,
    title: 'Playback Window - ' + session.projects.project.name,
    webPreferences: {
      nodeIntegrationInSubFrames: true,
    }
  }
}
