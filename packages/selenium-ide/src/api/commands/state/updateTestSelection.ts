import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { getActiveSuite } from 'api/helpers/getActiveData'
import { updateSelection } from 'api/helpers/updateSelection'

export type Shape = (
  testIndex: number,
  batch: boolean,
  add: boolean,
  clear: boolean
) => Promise<void>

export const browser = browserHandler<Shape>()

export const mutator: Mutator<Shape> = (session, { params }) =>
  update(
    `state.editor.selectedTestIndexes`,
    (testIndexes: number[]) =>
      updateSelection(
        getActiveSuite(session).tests.map((_, index) => index),
        testIndexes,
        testIndexes.slice(-1)[0],
        params
      ),
    session
  )

export const main = mainHandler<Shape>(passthrough)
