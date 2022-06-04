import { BrowserInfo } from '../../types'

/**
 * Download a driver needed to instrument an available browser.
 */
export type Shape = (info: BrowserInfo) => Promise<void>
