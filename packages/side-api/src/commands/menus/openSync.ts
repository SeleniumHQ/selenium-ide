import { MenuNames } from './open'

export type Type = 'Handler'
/**
 * Opens one of our available menu types, and returns the name of the selected option.
 */
export type Shape = (name: MenuNames, ...args: any[]) => Promise<any>
