import set from 'lodash/fp/set'
import { mutator as addStepMutator } from '../tests/addSteps'
import { getActiveTest } from '../../helpers/getActiveData'
import { Mutator } from '../../types/base'

/**
 * Start recording interactions across playback windows
 */
export type Shape = () => Promise<string>

const setToRecording = set('state.status', 'recording')
export const mutator: Mutator<Shape> = (session, { result }) => {
  const projectIsRecording = setToRecording(session)
  const activeTest = getActiveTest(session)
  if (activeTest.commands.length) {
    return projectIsRecording
  }
  return addStepMutator(projectIsRecording, {
    params: [session.state.activeTestID, 0, []],
    result: [
      {
        id: result,
        command: 'open',
        target: '/',
        value: '',
        opensWindow: true,
        windowHandleName: 'root',
      },
    ],
  })
}
