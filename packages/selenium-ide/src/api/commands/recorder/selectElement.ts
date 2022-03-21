import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { LocatorFields, Mutator } from 'api/types'
import { mutator as updateStepMutator } from '../tests/updateStep'

export type Shape = (
  field: LocatorFields,
  element: [string, string][]
) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params }) => updateStepMutator(
  session,
  {
    params: [
      session.state.activeTestID,
      session.state.activeCommandID,
      {
        [params[0]]: params[1],
      }
    ],
    result: undefined,
  },
)

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
