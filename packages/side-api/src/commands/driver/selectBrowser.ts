import { BrowserInfo } from '../../types/base'

/**
 * Select a browser to run. Currently only Electron is allowed.
 */
export type Shape = (selected: BrowserInfo) => Promise<void>
