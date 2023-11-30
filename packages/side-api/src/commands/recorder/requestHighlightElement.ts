import { LocatorFields } from '../../types/base'

/**
 * Asks the playback windows to highlight the current locator.
 */
export type Shape = (fieldName: LocatorFields) => Promise<void>
