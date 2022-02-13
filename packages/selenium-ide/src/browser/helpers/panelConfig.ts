import { BrowserWindowConstructorOptions } from 'electron'

const panelConfig: BrowserWindowConstructorOptions = {
  alwaysOnTop: true,
  center: false,
  frame: false,
  roundedCorners: false,
  minimizable: false,
  maximizable: false,
  closable: false,
  focusable: false,
}

export default panelConfig;
