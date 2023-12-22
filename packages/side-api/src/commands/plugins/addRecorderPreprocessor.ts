import { RecorderPreprocessor } from '../../types/plugin'

/**
 * This api call only works from a sanboxed preload script, and is used to
 * register middleware to modify recorded commands
 */
export type Shape = (preprocessor: RecorderPreprocessor) => void
