import { BaseListener } from '../../types/base'

/**
 * Runs when a playback window is opened
 */
export type OnPlaybackWindowOpened = [
  id: number,
  update: {
    test?: string
    title?: string
    url: string
  }
]
export type Shape = BaseListener<OnPlaybackWindowOpened>
