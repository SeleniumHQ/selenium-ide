import { WindowConfig } from 'browser/types'

const DEFAULT_WIDTH = 500
const DEFAULT_HEIGHT = 200

export const window: WindowConfig['window'] = () => ({
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  resizable: false,
  minimizable: false,
  fullscreenable: false,
  autoHideMenuBar: true,
  frame: false,
  maximizable: false,
  show: false,
  skipTaskbar: true,
  useContentSize: false,
  title: 'Window Prompt Polyfill',
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  },
})
