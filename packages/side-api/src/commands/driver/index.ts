import { Shape as download } from './download'
import { Shape as listBrowsers } from './listBrowsers'
import { Shape as selectBrowser } from './selectBrowser'
import { Shape as startProcess } from './startProcess'
import { Shape as stopProcess } from './stopProcess'

export * as download from './download'
export * as listBrowsers from './listBrowsers'
export * as selectBrowser from './selectBrowser'
export * as startProcess from './startProcess'
export * as stopProcess from './stopProcess'

/**
 * This governs spinning up webdrivers, building the instances, and spinning
 * back down
 */
export type Shape = {
  download: download
  listBrowsers: listBrowsers
  selectBrowser: selectBrowser
  startProcess: startProcess
  stopProcess: stopProcess
}
