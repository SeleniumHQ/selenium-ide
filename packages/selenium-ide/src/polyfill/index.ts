import { BasePolyfill } from './types'
import * as contextMenus from './api/contextMenus'
import * as downloads from './api/downloads'
import * as runtime from './api/runtime'
import * as tabs from './api/tabs'
import * as webNavigation from './api/webNavigation'
import * as windows from './api/windows'

export interface Polyfill extends BasePolyfill {
  contextMenus: typeof contextMenus
  downloads: typeof downloads
  runtime: typeof runtime
  tabs: typeof tabs
  webNavigation: typeof webNavigation
  windows: typeof windows
}

const polyfill: Polyfill = {
  contextMenus,
  downloads,
  runtime,
  tabs,
  webNavigation,
  windows,
}

export default polyfill
