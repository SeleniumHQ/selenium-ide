import { BrowserWindowConstructorOptions } from 'electron'

const panelConfig: BrowserWindowConstructorOptions = {
  center: false,
  frame: false,
  roundedCorners: false,
  minimizable: false,
  maximizable: false,
  closable: true,
  focusable: false,
  resizable: false,
}

export default panelConfig;
