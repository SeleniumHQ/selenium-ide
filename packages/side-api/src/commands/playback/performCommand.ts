import { CommandShape } from '@seleniumhq/side-model'

/**
 * Attempts to execute a command supplied via API directly
 */
export type Shape = (cmd: Omit<CommandShape, 'id'>) => Promise<boolean>
