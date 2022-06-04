import { CommandShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { getActiveCommandIndex } from '../../helpers/getActiveData'
import { CoreSessionData, Mutator, RecordNewCommandInput } from '../../types'
import { mutator as addStepsMutator } from '../tests/addSteps'

/**
 * Adds new commands to the current test at the current index
 */
export type Shape = (
  cmd: RecordNewCommandInput
) => Promise<CommandShape[] | null>

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

const processSelectFrameCommands = (
  sesh: CoreSessionData,
  command: CommandShape
) => {
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
