import { BaseListener } from '../../types'

/**
 * Called when the project editor asks the recorder to highlight an element
 * on the playback page.
 */
export type Shape = BaseListener<OnLogSystem>
export type OnLogSystem = [
  'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error',
  string
]
