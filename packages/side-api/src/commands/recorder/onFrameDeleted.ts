import { BaseListener } from '../../types'

export type OnFrameDeletedRecorder = []

/**
 * Called when a frame is deleted
 */
export type Shape = BaseListener<OnFrameDeletedRecorder>
