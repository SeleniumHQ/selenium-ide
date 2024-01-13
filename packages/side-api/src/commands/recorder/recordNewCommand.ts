import { CommandShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import {
  getActiveTest,
  getActiveCommandIndex,
} from '../../helpers/getActiveData'
import {
  CoreSessionData,
  Mutator,
  RecordNewCommandInput,
} from '../../types/base'
import { mutator as addStepsMutator } from '../tests/addSteps'
import { mutator as updateStepSelection } from '../state/updateStepSelection'

/**
 * Adds new commands to the current test at the current index
 */
export type Shape = (
  cmd: RecordNewCommandInput,
  overrideRecorder?: boolean
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

const processStoreWindowHandle = (session: CoreSessionData) => {
  const activeTest = getActiveTest(session)
  const activeIndex = getActiveCommandIndex(session)
  const commands = activeTest.commands
  for (let i = 0, len = commands.length; i < len; i++) {
    let item = commands[i]
    let target = item.target as string
    if (item.opensWindow && item.windowHandleName) {
      let storeWindowHandle = {
        command: 'storeWindowHandle',
        id: '0000-0000-0000-0000',
        target: 'root',
        value: '',
      }
      session = addStepsMutator(session, {
        params: [session.state.activeTestID, i - 1, []],
        result: [storeWindowHandle],
      })
      return updateStepSelection(session, {
        params: [activeIndex + 1, false, false, true],
        result: undefined,
      })
    } else if (item.command === 'storeWindowHandle' && target === 'root') {
      return session
    }
  }

  return session
}

export const mutator: Mutator<Shape> = (
  session,
  { params: [cmdInput], result }
) => {
  if (!result) return session

  const sessionWithStoreCommands = processStoreWindowHandle(session)

  const sessionWithSelectFrameCommands = result.reduce(
    processSelectFrameCommands,
    sessionWithStoreCommands
  )
  const commandIndex = getActiveCommandIndex(sessionWithSelectFrameCommands)
  return addStepsMutator(sessionWithSelectFrameCommands, {
    params: [
      session.state.activeTestID,
      commandIndex,
      [cmdInput as CommandShape],
    ],
    result,
  })
}
