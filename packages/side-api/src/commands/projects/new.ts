import { ProjectShape } from '@seleniumhq/side-model'
import { Mutator } from '../../types/base'

/**
 * Creates a new project
 */
export type Shape = () => Promise<ProjectShape>

export const mutator: Mutator<Shape> = (session, { result }) => ({
  ...session,
  state: {
    ...session.state,
    activeTestID: result.tests[0].id,
    editor: {
      ...session.state.editor,
      selectedCommandIndexes: [0],
    },
  },
  project: result,
})
