import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { AsyncReturnType, Mutator } from 'api/types'
import loadingID from 'api/constants/loadingID'

export type Shape = Session['projects']['load']
export type Response = AsyncReturnType<Shape>

export const mutator: Mutator<Shape> = (session, { result }) => ({
  project: result,
  state: {
    ...session.state,
    activeTestID: result.tests?.[0]?.id ?? loadingID,
    activeCommandID: result.tests?.[0]?.commands?.[0]?.id ?? loadingID,
  },
})

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
