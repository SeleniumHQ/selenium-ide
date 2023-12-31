/**
 * Emit messages along a channel
 */
export type Shape = (channel: string, ...args: any[]) => Promise<void>
