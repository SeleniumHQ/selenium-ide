import { BaseListener } from '../../types/base'

/**
 * Runs when a playback window is updated
 */
export type OnPlaybackWindowChanged = [
  id: number,
  update: Partial<{
    focused: boolean
    state: 'idle' | 'playing' | 'recording' | 'paused'
    test: string
    title: string
    url: string
    visible: boolean
  }>
]
export type Shape = BaseListener<OnPlaybackWindowChanged>
