import config from './config'
import Store from 'electron-store'
import { BrowserInfo } from 'main/types'

export interface StorageSchema {
  config: typeof config
  browserInfo: BrowserInfo
  plugins: string[]
  recentProjects: string[]
  windowSize: number[]
  windowPosition:number[]
}

const store = new Store<StorageSchema>({
  defaults: {
    browserInfo: {
      browser: 'chrome',
      version: '',
    },
    config,
    plugins: [],
    recentProjects: [],
    windowSize: [],
    windowPosition: []
  },
})

export default store
