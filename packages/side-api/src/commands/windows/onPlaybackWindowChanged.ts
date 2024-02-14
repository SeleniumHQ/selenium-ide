import { BaseListener } from '../../types/base'

/**
 * Runs when a playback window is updated
 */
export type OnPlaybackWindowChanged = [
  id: number,
  update: Partial<{
    focused: boolean
    state: 'idle' | 'playing' | 'recording' | 'paused'
    title: string
    visible: boolean
  }>
]
export type Shape = BaseListener<OnPlaybackWindowChanged>
