/**
 * Shift focus b/w the project editor and the playback window
 */
export type Shape = (target: 'editor' | 'playback') => Promise<void>
