import { WindowConfig } from 'browser/types'

const DEFAULT_WIDTH = 400
const DEFAULT_HEIGHT = 150

export const window: WindowConfig['window'] = () => ({
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  minWidth: DEFAULT_WIDTH,
  minHeight: DEFAULT_HEIGHT,
  resizable: false,
  minimizable: false,
  fullscreenable: false,
  autoHideMenuBar: true,
  maximizable: false,
  show: false,
  skipTaskbar: true,
  useContentSize: false,
  modal: true,
  title: 'Window Prompt Polyfill',
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  },
})
