import { CommandShape } from '@seleniumhq/side-model'
import { BaseListener, EventMutator, RecordNewCommandInput } from '../../types'
import { mutator as recordNewCommandMutator } from './recordNewCommand'
import { mutator as updateStepTestsMutator } from '../tests/updateStep'
import { getActiveCommand } from '../../helpers/getActiveData'

type windowID = string
type selectWindowStepID = string

/**
 * Called when a new playback window is created
 */
export type Shape = BaseListener<OnNewWindowRecorder>
export type OnNewWindowRecorder = [windowID, selectWindowStepID]

export const mutator: EventMutator<OnNewWindowRecorder> = (
  session,
  [windowID, selectWindowStepID]
) => {
  const sessionWithPreviousStepUpdatedToOpenNewWindow = updateStepTestsMutator(
    session,
    {
      params: [
        session.state.activeTestID,
        getActiveCommand(session).id,
        {
          opensWindow: true,
          windowHandleName: windowID,
          windowTimeout: 2000,
        },
      ],
      result: undefined,
    }
  )
  const selectWindowStep: CommandShape = {
    id: selectWindowStepID,
    command: 'selectWindow',
    target: 'handle=${' + windowID + '}',
    value: '',
  }
  const sessionWithselectWindowStep = recordNewCommandMutator(
    sessionWithPreviousStepUpdatedToOpenNewWindow,
    {
      params: [selectWindowStep as RecordNewCommandInput],
      result: [selectWindowStep],
    }
  )
  return sessionWithselectWindowStep
}
