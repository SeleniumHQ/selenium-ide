import { BrowsersInfo } from '../../types'

/**
 * List available browsers to be driven.
 */
export type Shape = () => Promise<BrowsersInfo>
