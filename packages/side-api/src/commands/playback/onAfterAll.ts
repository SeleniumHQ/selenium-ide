import { BaseListener } from '../../types'

/**
 * Runs after a suite completes
 */
export type OnAfterAllPlayback = [
  {
    suite: string
  }
]
export type Shape = BaseListener<OnAfterAllPlayback>
