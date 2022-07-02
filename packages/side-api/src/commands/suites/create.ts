import { SuiteShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { Mutator } from '../../types'

/**
 * Creates a new suite
 */
export type Shape = (name?: string) => Promise<SuiteShape>

export const mutator: Mutator<Shape> = (session, { result }) =>
  update('project.suites', (suites) => suites.concat(result), session)
