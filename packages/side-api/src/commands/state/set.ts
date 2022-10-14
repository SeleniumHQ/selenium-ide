import set from 'lodash/fp/set'
import { Mutator } from '../../types'

/**
 * Sets the active command for the test editor
 */
export type Shape = (path: string, value: any) => Promise<boolean>

export const mutator: Mutator<Shape> = (
  session,
  { params: [path, value] }
) => ({
  ...session,
  state: set(path, value, session.state),
})
