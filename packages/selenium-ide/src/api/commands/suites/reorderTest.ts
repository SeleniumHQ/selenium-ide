import { SuiteShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { hasID } from 'api/helpers/hasID'

export type Shape = (
  suiteID: string,
  oldIndex: number,
  newIndex: number
) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, oldIndex, newIndex] }
) => {
  const suiteIndex = session.project.suites.findIndex(hasID(suiteID))
  return update(
    `project.suites.${suiteIndex}.tests`,
    (tests: SuiteShape['tests']) => {
      const testID = tests.splice(oldIndex, 1).pop() as string
      tests.splice(newIndex, 0, testID)
      return tests
    },
    session
  )
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
