import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { getActiveCommandIndex, getActiveTest } from 'api/helpers/getActiveData'
import { mutator as setActiveCommand } from './setActiveCommand'
import { updateSelection } from 'api/helpers/updateSelection'
import loadingID from 'api/constants/loadingID'

export type Shape = (
  commandIndex: number,
  batch: boolean,
  add: boolean,
  clear: boolean
) => Promise<void>

export const browser = browserHandler<Shape>()

export const mutator: Mutator<Shape> = (session, { params }) => {
  const activeTest = getActiveTest(session)
  const newSession = update(
    `state.editor.selectedCommandIndexes`,
    (indexes: number[]) =>
      updateSelection(
        activeTest.commands.map((_cmd, index) => index),
        indexes,
        indexes.slice(-1)[0],
        params
      ),
    session
  )
  const {
    state: { editor },
  } = session
  const activeCommandIndex = getActiveCommandIndex(session, activeTest)
  if (!editor.selectedCommandIndexes.includes(activeCommandIndex)) {
    const lastCommandIndex = editor.selectedCommandIndexes.slice(-1)[0]
    const newActiveCommand =
      activeTest.commands[lastCommandIndex]?.id || loadingID
    return setActiveCommand(newSession, {
      params: [newActiveCommand],
      result: true,
    })
  } else {
    return newSession
  }
}

export const main = mainHandler<Shape>(passthrough)
