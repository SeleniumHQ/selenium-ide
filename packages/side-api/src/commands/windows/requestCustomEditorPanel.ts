/**
 * Load a custom editor panel from a URL (file or http).
 */
export type Shape = (name: string, url: string) => Promise<void>
