import set from 'lodash/fp/set'
import { mutator as addStepMutator } from '../tests/addSteps'
import { getActiveCommandIndex } from '../../helpers/getActiveData'
import { Mutator } from '../../types'

/**
 * Start recording interactions across playback windows
 */
export type Shape = () => Promise<string | null>

const setToRecording = set('state.status', 'recording')
export const mutator: Mutator<Shape> = (session, { result }) => {
  const projectIsRecording = setToRecording(session)
  if (!result) {
    return projectIsRecording
  }
  return addStepMutator(projectIsRecording, {
    params: [session.state.activeTestID, getActiveCommandIndex(session), []],
    result: [
      {
        id: result,
        command: 'open',
        target: '/',
        value: '',
      },
    ],
  })
}
