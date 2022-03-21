import { CommandShape } from '@seleniumhq/side-model'
import { EventMutator } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'
import { mutator as recordNewCommandMutator } from './recordNewCommand'
import { mutator as updateStepTestsMutator } from '../tests/updateStep'

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
        session.state.activeCommandID,
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
      params: [selectWindowStep],
      result: selectWindowStep,
    }
  )
  return sessionWithselectWindowStep
}

export const browser = browserEventListener<OnNewWindowRecorder>()
export const main = mainEventListener<OnNewWindowRecorder>()
