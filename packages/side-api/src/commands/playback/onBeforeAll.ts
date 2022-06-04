export type Type = 'EventListener'

/**
 * Runs before a suite begins
 */
export type OnBeforeAllPlayback = [
  {
    suite: string
  }
]
export type Shape = OnBeforeAllPlayback
