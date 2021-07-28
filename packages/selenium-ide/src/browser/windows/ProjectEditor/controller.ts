import { WindowConfig } from 'browser/types'

export const window: WindowConfig['window'] = () => ({
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  title: 'Selenium IDE - Project Editor',
})
