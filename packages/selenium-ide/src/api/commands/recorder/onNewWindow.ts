import { CommandShape } from '@seleniumhq/side-model'
import { EventMutator } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'
import { mutator as recordNewCommandMutator } from './recordNewCommand'
import { mutator as updateStepTestsMutator } from '../tests/updateStep'

type windowID = string
type switchToWindowStepID = string
export type OnNewWindowRecorder = [windowID, switchToWindowStepID]

export const mutator: EventMutator<OnNewWindowRecorder> = (
  session,
  [windowID, switchToWindowStepID]
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
      result: true,
    }
  )
  const switchToWindowStep: CommandShape = {
    id: switchToWindowStepID,
    command: 'switchToWindow',
    target: '${' + windowID + '}',
    value: '',
  }
  const sessionWithSwitchToWindowStep = recordNewCommandMutator(
    sessionWithPreviousStepUpdatedToOpenNewWindow,
    {
      params: [switchToWindowStep],
      result: switchToWindowStep,
    }
  )
  return sessionWithSwitchToWindowStep
}

export const browser = browserEventListener<OnNewWindowRecorder>()
export const main = mainEventListener<OnNewWindowRecorder>()
