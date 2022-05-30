import { BrowserInfo } from '../../types'

/**
 * Start the driver process for the browser, eg Chromedriver etc..
 */
export type Shape = (info: BrowserInfo) => Promise<Error | null>
