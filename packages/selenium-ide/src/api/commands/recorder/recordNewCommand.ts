import { CommandShape } from '@seleniumhq/side-model'
import { getActiveCommandIndex } from 'api/helpers/getActiveData'
import { CoreSessionData, Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import update from 'lodash/fp/update'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { mutator as addStepsMutator } from '../tests/addSteps'

export type Shape = Session['recorder']['recordNewCommand']

const traverseFrame = (target: string) =>
  update('state.recorder.activeFrame', (frame) => {
    const traversalKey = target.split('=').pop()
    switch (traversalKey) {
      case 'top':
        return 'root'
      case 'parent':
        return frame.split('/').slice(0, -1).join('/')
      default:
        return `${frame}/${traversalKey}`
    }
  })

const processSelectFrameCommands = (sesh: CoreSessionData, command: CommandShape) => {
  if (command.command === 'selectFrame') {
    return traverseFrame(command.target as string)(sesh)
  }
  return sesh
}

export const mutator: Mutator<Shape> = (
  session,
  { params: [cmdInput], result }
) => {
  if (!result) return session
  const commandIndex = getActiveCommandIndex(session)
  const sessionWithNewSteps = addStepsMutator(session, {
    params: [
      session.state.activeTestID,
      commandIndex,
      [cmdInput as CommandShape],
    ],
    result,
  })
  return result.reduce(processSelectFrameCommands, sessionWithNewSteps)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
