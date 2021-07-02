import { BasePolyfill } from './types'
import * as browserAction from './browserAction'
import * as contextMenus from './contextMenus'
import * as downloads from './downloads'
import * as runtime from './runtime'
import * as tabs from './tabs'
import * as webNavigation from './webNavigation'
import * as windows from './windows'

export interface Polyfill extends BasePolyfill {
  browserAction: typeof browserAction
  contextMenus: typeof contextMenus
  downloads: typeof downloads
  runtime: typeof runtime
  tabs: typeof tabs
  webNavigation: typeof webNavigation
  windows: typeof windows
}

const polyfill: Polyfill = {
  browserAction,
  contextMenus,
  downloads,
  runtime,
  tabs,
  webNavigation,
  windows,
}

export default polyfill
