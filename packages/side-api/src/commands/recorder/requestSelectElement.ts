import { LocatorFields } from '../../types'

/**
 * Asks the playback windows to set the next element clicked as the currently
 * selected locator field element.
 */
export type Shape = (
  activate: boolean,
  fieldName: LocatorFields
) => Promise<void>
