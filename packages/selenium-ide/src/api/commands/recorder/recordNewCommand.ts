import { getActiveCommandIndex } from 'api/helpers/getActiveData'
import { Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import set from 'lodash/fp/set'
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
  return result.reduce((sesh, command) => {
    const newSession = addStepMutator(sesh, {
      params: [
        session.state.activeTestID,
        cmdInput.insertBeforeLastCommand ? index - 1 : index,
      ],
      result: command,
    })
    index += 1
    if (command.command === 'selectFrame') {
      return set('state.recorder.activeFrame', command.target, newSession)
    }
    return newSession
  }, session)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
