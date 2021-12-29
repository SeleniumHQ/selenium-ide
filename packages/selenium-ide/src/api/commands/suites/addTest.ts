import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { CoreSessionData, Mutator } from 'api/types'

export type Shape = Session['suites']['addTest']

export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, testID] }
) =>
  update(
    'project.suites',
    (suites: CoreSessionData['project']['suites']) => {
      const suiteIndex = suites.findIndex((suite) => suite.id === suiteID)
      return update(
        `${suiteIndex}.tests`,
        (tests) => tests.concat(testID),
        suites
      )
    },
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
