import { BaseListener } from '../../types/base'

/**
 * Called when the project editor asks the recorder to select an element.
 */
export type Shape = BaseListener<
  OnRequestElementAtRecorder,
  OnRequestElementAtRecorderResult
>
export type OnRequestElementAtRecorder = [number, number]
export type OnRequestElementAtRecorderResult = [string, string][] | null
