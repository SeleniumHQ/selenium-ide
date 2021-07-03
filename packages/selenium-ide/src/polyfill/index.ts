import { BasePolyfill } from './types'
import * as contextMenus from './contextMenus'
import * as downloads from './downloads'
import * as runtime from './runtime'
import * as tabs from './tabs'
import * as webNavigation from './webNavigation'
import * as windows from './windows'

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
