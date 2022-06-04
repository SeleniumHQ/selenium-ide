import { Mutator } from '../../types'

/**
 * Sets the active test for the test editor
 */
export type Shape = (testID: string) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [activeTestID] }
) => ({
  ...session,
  state: {
    ...session.state,
    activeTestID,
    editor: {
      ...session.state.editor,
      selectedCommandIndexes: [0],
    },
  },
})
