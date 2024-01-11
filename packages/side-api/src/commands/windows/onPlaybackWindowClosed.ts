import { BaseListener } from '../../types/base'

/**
 * Runs when a playback window is closed
 */
export type OnPlaybackWindowClosed = [id: number]
export type Shape = BaseListener<OnPlaybackWindowClosed>
