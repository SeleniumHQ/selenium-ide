import config from './config'
import Store from 'electron-store'

interface WindowPositionBound {
  x: number
  y: number
  width: number
  height: number
}

export interface StorageSchema {
  config: typeof config
  plugins: string[]
  recentProjects: string[]
  windowPositionBounds: {
    [key: string]: WindowPositionBound
  }
}

export default new Store<StorageSchema>({
  defaults: {
    config,
    plugins: [],
    recentProjects: [],
    windowPositionBounds: {},
  },
})
