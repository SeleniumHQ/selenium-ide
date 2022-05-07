import config from './config'
import Store from 'electron-store'
import { StateShape } from 'api/types'
import { BrowserInfo } from 'main/types'

export interface StorageSchema {
  config: typeof config
  browserInfo: BrowserInfo
  plugins: string[]
  projectStates: Record<string, StateShape>
  recentProjects: string[]
  windowSize: number[]
  windowPosition: number[]
}

const store = new Store<StorageSchema>({
  defaults: {
    browserInfo: {
      browser: 'chrome',
      version: '',
    },
    config,
    plugins: [],
    projectStates: {},
    recentProjects: [],
    windowSize: [],
    windowPosition: []
  },
})

export default store
