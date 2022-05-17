import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'

export type Shape = (testID: string) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [activeTestID] }
) => ({
  ...session,
  state: {
    ...session.state,
    activeTestID,
    editor: {
      ...session.state.editor,
      selectedCommandIndexes: [0],
    },
  },
})

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
