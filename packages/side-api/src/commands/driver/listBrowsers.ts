import { BrowsersInfo } from '../../types/base'

/**
 * List available browsers to be driven.
 */
export type Shape = () => Promise<BrowsersInfo>
