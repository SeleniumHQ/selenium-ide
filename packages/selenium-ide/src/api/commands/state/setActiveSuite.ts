import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'
import loadingID from 'api/constants/loadingID'

export type Shape = Session['state']['setActiveSuite']

export const mutator: Mutator<Shape> = (
  session,
  { params: [activeSuiteID] }
) => {
  const activeTestID =
    session.project.suites.find((s) => s.id === activeSuiteID)?.tests?.[0] ??
    loadingID
  const activeCommandID =
    session.project.tests.find((t) => t.id === activeTestID)?.commands?.[0]
      ?.id ?? loadingID
  return {
    ...session,
    state: {
      ...session.state,
      activeSuiteID,
      activeTestID,
      activeCommandID,
    },
  }
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
