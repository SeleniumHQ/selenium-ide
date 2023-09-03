import { BrowserInfo } from '../../types/base'

/**
 * Download a driver needed to instrument an available browser.
 */
export type Shape = (info: BrowserInfo) => Promise<void>
