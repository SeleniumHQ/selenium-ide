import set from 'lodash/fp/set'
import { mutator as addStepMutator } from '../tests/addSteps'
import {
  getActiveCommandIndex,
  getActiveTest,
  getActiveWindowHandleID,
} from '../../helpers/getActiveData'
import { Mutator } from '../../types/base'

/**
 * Start recording interactions across playback windows
 */
export type Shape = () => Promise<null | {
  newStepID: string
  windowHandle: string | null
}>

const setToRecording = set('state.status', 'recording')
export const mutator: Mutator<Shape> = (session, { result }) => {
  const projectIsRecording = setToRecording(session)
  if (!result) {
    return projectIsRecording
  }
  const { newStepID, windowHandle } = result
  const activeTest = getActiveTest(session)
  if (!activeTest.commands.length) {
    return addStepMutator(projectIsRecording, {
      params: [session.state.activeTestID, 0, []],
      result: [
        {
          id: newStepID,
          command: 'open',
          target: '/',
          value: '',
          opensWindow: true,
          windowHandleName: 'root',
        },
      ],
    })
  }
  const activeCommandIndex = Math.max(0, getActiveCommandIndex(session))
  const activeWindowHandleID = getActiveWindowHandleID(session) || 'root'
  if (activeWindowHandleID === windowHandle) return projectIsRecording
  return addStepMutator(projectIsRecording, {
    params: [session.state.activeTestID, activeCommandIndex],
    result: [
      {
        id: newStepID,
        command: 'selectWindow',
        target: 'handle=${' + windowHandle + '}',
        value: '',
      },
    ],
  })
}
