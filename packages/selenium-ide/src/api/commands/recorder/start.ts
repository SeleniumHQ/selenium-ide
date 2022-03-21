import set from 'lodash/fp/set'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'
import { mutator as addStepMutator } from '../tests/addStep'
import { getActiveCommandIndex } from 'api/helpers/getActiveData'

export type Shape = Session['recorder']['start']

const setToRecording = set('state.status', 'recording')
export const mutator: Mutator<Shape> = (session, { result }) => {
  const projectIsRecording = setToRecording(session)
  if (!result) {
    return projectIsRecording
  }
  return addStepMutator(projectIsRecording, {
    params: [
      session.state.activeTestID,
      getActiveCommandIndex(
        session,
      ),
    ],
    result: {
      id: result,
      command: 'open',
      target: '/',
      value: '',
    },
  })
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
