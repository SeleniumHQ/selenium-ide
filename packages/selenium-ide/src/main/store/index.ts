import config from './config'
import Store from 'electron-store'
import { BrowserInfo } from 'main/types'

interface WindowPositionBound {
  x: number
  y: number
  width: number
  height: number
}

export interface StorageSchema {
  config: typeof config
  browserInfo: BrowserInfo,
  plugins: string[]
  recentProjects: string[]
  windowPositionBounds: {
    [key: string]: WindowPositionBound
  }
}

const store = new Store<StorageSchema>({
  defaults: {
    browserInfo: {
      browser: 'chrome',
      version: ''
    },
    config,
    plugins: [],
    recentProjects: [],
    windowPositionBounds: {},
  },
})

export default store
