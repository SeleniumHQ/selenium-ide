import { SuiteShape } from '@seleniumhq/side-model'
import merge from 'lodash/fp/merge'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { CoreSessionData, Mutator } from 'api/types'

export type Shape = Session['suites']['update']

const hasID = (id: string) => (obj: { id: string }) => obj.id === id

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

export const main = mainHandler<Shape>()
