import { BaseListener } from '../../types/base'

/**
 * Runs before a test begins
 */
export type OnBeforePlayback = [
  {
    suite: string
    test: string
    startIndex: number
    endIndex: number
  }
]
export type Shape = BaseListener<OnBeforePlayback>
