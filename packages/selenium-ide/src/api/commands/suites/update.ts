import { SuiteShape } from '@seleniumhq/side-model'
import { hasID } from 'api/helpers/hasID'
import { CoreSessionData, Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import merge from 'lodash/fp/merge'
import update from 'lodash/fp/update'
import mainHandler, { passthrough } from 'main/api/classes/Handler'

export type Shape = (
  suiteID: string,
  updates: Partial<Omit<SuiteShape, 'tests'>>
) => Promise<void>

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [suiteID, updates] }
) => {
  const suiteIndex = session.project.suites.findIndex(hasID(suiteID))
  const updatedSession = update(
    `project.suites[${suiteIndex}]`,
    (suite: SuiteShape) => merge(suite, updates),
    session
  )
  return updatedSession
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
