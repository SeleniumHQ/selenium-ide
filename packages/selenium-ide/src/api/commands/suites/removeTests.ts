import { SuiteShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { hasID } from 'api/helpers/hasID'

export type Shape = (suiteID: string, testIDs: string[]) => Promise<void>
export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, testIDs] }
) =>
  update(
    'project.suites',
    (suites: SuiteShape[]) => {
      const suiteIndex = suites.findIndex(hasID(suiteID))
      return update(
        `${suiteIndex}.tests`,
        (tests: SuiteShape['tests']) => tests.filter((id) => !testIDs.includes(id)),
        suites
      )
    },
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
