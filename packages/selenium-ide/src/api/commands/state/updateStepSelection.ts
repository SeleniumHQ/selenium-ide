import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { getActiveTest } from 'api/helpers/getActiveData'
import { updateSelection } from 'api/helpers/updateSelection'

export type Shape = (
  commandIndex: number,
  batch: boolean,
  add: boolean,
  clear: boolean
) => Promise<void>

export const browser = browserHandler<Shape>()

export const mutator: Mutator<Shape> = (session, { params }) => {
  const activeTest = getActiveTest(session)
  return update(
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
}

export const main = mainHandler<Shape>(passthrough)
