import { BaseListener } from '../../types'

/**
 * Called when the project editor asks the recorder to highlight an element
 * on the playback page.
 */
export type Shape = BaseListener<OnHighlightElementRecorder>
export type OnHighlightElementRecorder = [string]
