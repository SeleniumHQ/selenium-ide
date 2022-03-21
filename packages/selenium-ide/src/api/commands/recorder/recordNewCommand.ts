import { getActiveCommandIndex } from 'api/helpers/getActiveData'
import { Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { mutator as addStepMutator } from '../tests/addStep'

export type Shape = Session['recorder']['recordNewCommand']

export const mutator: Mutator<Shape> = (
  session,
  { params: [cmdInput], result }
) => {
  if (!result) return session
  let index = getActiveCommandIndex(session)
  return addStepMutator(session, {
    params: [
      session.state.activeTestID,
      cmdInput.insertBeforeLastCommand ? index - 1 : index,
    ],
    result,
  })
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
