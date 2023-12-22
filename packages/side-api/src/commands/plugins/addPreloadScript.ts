/**
 * This api call only works from a preload script, and is used to
 * register middleware to modify recorded commands
 *
 * Script is the javascript to be executed in the browsing context.
 *
 * Sandbox is whether the browsing context is the parent(false) or
 * the recorder context(true, default).
 */
export type Shape = (script: string, sandbox?: boolean) => void
