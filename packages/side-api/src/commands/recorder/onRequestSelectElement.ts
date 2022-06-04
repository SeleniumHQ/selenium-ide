import { BaseListener, LocatorFields } from '../../types'

/**
 * Called when the project editor asks the recorder to select an element.
 */
export type Shape = BaseListener<OnRequestSelectElementRecorder>
export type OnRequestSelectElementRecorder = [boolean, LocatorFields]
