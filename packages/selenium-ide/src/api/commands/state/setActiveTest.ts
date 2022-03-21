import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'
import loadingID from 'api/constants/loadingID'
import { hasID } from 'api/helpers/hasID'

export type Shape = Session['state']['setActiveTest']

export const mutator: Mutator<Shape> = (
  session,
  { params: [activeTestID] }
) => {
  const activeCommandID =
    session.project.tests.find(hasID(activeTestID))?.commands?.[0]
      ?.id ?? loadingID
  return {
    ...session,
    state: {
      ...session.state,
      activeTestID,
      activeCommandID,
    },
  }
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
