import { ProjectShape } from '@seleniumhq/side-model'
import { Mutator } from '../../types'

/**
 * Creates a new project
 */
export type Shape = () => Promise<ProjectShape>

export const mutator: Mutator<Shape> = (session, { result }) => ({
  ...session,
  state: {
    ...session.state,
    activeTestID: result.tests[0].id,
  },
  project: result,
})
