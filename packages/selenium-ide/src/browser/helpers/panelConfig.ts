import { BrowserWindowConstructorOptions } from 'electron'

const panelConfig: BrowserWindowConstructorOptions = {
  center: false,
  frame: true,
  roundedCorners: true,
  minimizable: true,
  maximizable: true,
  closable: true,
  focusable: false,
  resizable: true,
}

export default panelConfig;
