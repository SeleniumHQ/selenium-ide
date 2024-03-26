import { BaseListener } from '../../types/base'

export type Type = 'EventListener'

/**
 * Emitted to the frontend when requested from the backend
 */
export type OnRequestCustomEditorPanel = [name: string, url: string]
export type Shape = BaseListener<OnRequestCustomEditorPanel>
