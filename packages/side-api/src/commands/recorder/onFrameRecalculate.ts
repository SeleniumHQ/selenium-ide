import { BaseListener } from '../../types'

export type OnFrameRecalculateRecorder = []

/**
 * Called when a frame is added, to force the frame tree
 * to reflow itself
 */
export type Shape = BaseListener<OnFrameRecalculateRecorder>
