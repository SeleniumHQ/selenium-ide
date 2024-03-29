import type { Shape as Download } from './download'
import type { Shape as ListBrowsers } from './listBrowsers'
import type { Shape as SelectBrowser } from './selectBrowser'
import type { Shape as StartProcess } from './startProcess'
import type { Shape as StopProcess } from './stopProcess'
import type { Shape as TakeScreenshot } from './takeScreenshot'

import * as download from './download'
import * as listBrowsers from './listBrowsers'
import * as selectBrowser from './selectBrowser'
import * as startProcess from './startProcess'
import * as stopProcess from './stopProcess'
import * as takeScreenshot from './takeScreenshot'

export const commands = {
  download,
  listBrowsers,
  selectBrowser,
  startProcess,
  stopProcess,
  takeScreenshot,
}

/**
 * This governs spinning up webdrivers, building the instances, and spinning
 * back down
 */
export type Shape = {
  download: Download
  listBrowsers: ListBrowsers
  selectBrowser: SelectBrowser
  startProcess: StartProcess
  stopProcess: StopProcess
  takeScreenshot: TakeScreenshot
}
