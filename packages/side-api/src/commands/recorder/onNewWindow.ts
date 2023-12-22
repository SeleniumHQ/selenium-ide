import { CommandShape } from '@seleniumhq/side-model'
import {
  BaseListener,
  EventMutator,
  RecordNewCommandInput,
} from '../../types/base'
import { mutator as recordNewCommandMutator } from './recordNewCommand'
import { mutator as updateStepTestsMutator } from '../tests/updateStep'
import {
  getActiveCommand,
  getActiveWindowHandleID,
} from '../../helpers/getActiveData'

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
  const activeCommand = getActiveCommand(session)!
  const activeWindowHandleID = getActiveWindowHandleID(session) || 'root'
  const consistentWindowID = activeCommand.windowHandleName || windowID
  const sessionWithPreviousStepUpdatedToOpenNewWindow = updateStepTestsMutator(
    session,
    {
      params: [
        session.state.activeTestID,
        activeCommand.id,
        {
          opensWindow: true,
          windowHandleName: consistentWindowID,
          windowTimeout: 2000,
        },
      ],
      result: undefined,
    }
  )
  if (!activeWindowHandleID) {
    return sessionWithPreviousStepUpdatedToOpenNewWindow
  }
  const selectWindowStep: CommandShape = {
    id: selectWindowStepID,
    command: 'selectWindow',
    target: 'handle=${' + consistentWindowID + '}',
    value: '',
  }
  const sessionWithSelectWindowStep = recordNewCommandMutator(
    sessionWithPreviousStepUpdatedToOpenNewWindow,
    {
      params: [selectWindowStep as RecordNewCommandInput],
      result: [selectWindowStep],
    }
  )
  return sessionWithSelectWindowStep
}
