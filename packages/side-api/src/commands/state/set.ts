import set from 'lodash/fp/set'
import { Mutator } from '../../types/base'

/**
 * Sets a key on the session state
 */
export type Shape = (path: string, value: any) => Promise<boolean>

export const mutator: Mutator<Shape> = (
  session,
  { params: [path, value] }
) => ({
  ...session,
  state: set(path, value, session.state),
})
