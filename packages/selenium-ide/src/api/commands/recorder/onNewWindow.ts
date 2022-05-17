import { CommandShape } from '@seleniumhq/side-model'
import { EventMutator } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'
import { mutator as recordNewCommandMutator } from './recordNewCommand'
import { mutator as updateStepTestsMutator } from '../tests/updateStep'
import { RecordNewCommandInput } from 'main/session/controllers/Recorder'
import { getActiveCommand } from 'api/helpers/getActiveData'

type windowID = string
type selectWindowStepID = string
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

export const browser = browserEventListener<OnNewWindowRecorder>()
export const main = mainEventListener<OnNewWindowRecorder>()
