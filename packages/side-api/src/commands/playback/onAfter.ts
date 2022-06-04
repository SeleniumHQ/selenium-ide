import { BaseListener } from '../../types'

/**
 * Runs after a test completes
 */
export type OnAfterPlayback = [
  {
    suite: string
    test: string
    endIndex: number
    status: 'success' | 'failure'
    error?: string
  }
]
export type Shape = BaseListener<OnAfterPlayback>
