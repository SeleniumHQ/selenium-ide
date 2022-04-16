import { getActiveCommandIndex } from 'api/helpers/getActiveData'
import { Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import update from 'lodash/fp/update'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { mutator as addStepsMutator } from '../tests/addSteps'

export type Shape = Session['recorder']['recordNewCommand']

const traverseFrame = (target: string) =>
  update(
    'state.recorder.activeFrame',
    (frame) => {
      const traversalKey = target.split('=').pop()
      switch (traversalKey) {
        case 'top':
          return 'root'
        case 'parent':
          return frame.split('/').slice(0, -1).join('/')
        default:
          return `${frame}/${traversalKey}`
      }
    },
  )

export const mutator: Mutator<Shape> = (
  session,
  { params: [cmdInput], result }
) => {
  if (!result) return session
  let index = getActiveCommandIndex(session)
  return result.reduce((sesh, command) => {
    const newSession = addStepsMutator(sesh, {
      params: [
        session.state.activeTestID,
        cmdInput.insertBeforeLastCommand ? index - 1 : index,
      ],
      result: [command],
    })
    index += 1
    if (command.command === 'selectFrame') {
      return traverseFrame(command.target)(newSession)
    }
    return newSession
  }, session)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
