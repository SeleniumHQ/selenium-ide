import type { OpenDialogReturnValue } from 'electron'
/**
 * Shows an open file dialog and passes back the async result
 */
export type Shape = () => Promise<OpenDialogReturnValue>
