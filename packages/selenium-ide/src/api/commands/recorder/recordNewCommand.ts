import { CommandShape } from '@seleniumhq/side-model'
import { getActiveCommandIndex } from 'api/helpers/getActiveData'
import { Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import update from 'lodash/fp/update'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { mutator as setActiveCommand } from '../state/setActiveCommand'
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
  const commandIndex = getActiveCommandIndex(session) + 1
  const sessionWithNewSteps = result.reduce((sesh, command, resultIndex) => {
    const index = commandIndex + resultIndex
    const newSession = addStepsMutator(sesh, {
      params: [
        session.state.activeTestID,
        cmdInput.insertBeforeLastCommand ? index - 1 : index,
        [cmdInput as CommandShape],
      ],
      result: [command],
    })
    if (command.command === 'selectFrame') {
      return traverseFrame(command.target as string)(newSession)
    }
    return newSession
  }, session)
  return setActiveCommand(
    sessionWithNewSteps,
    {
      params: [result.slice(-1)[0].id],
      result: true,
    }
  )
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
