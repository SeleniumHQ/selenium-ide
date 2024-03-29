import { TestShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { Mutator } from '../../types/base'

/**
 * Create a new test
 */
export type Shape = (name?: string) => Promise<TestShape>

export const mutator: Mutator<Shape> = (session, { result }) =>
  update('project.tests', (tests) => tests.concat(result), session)
