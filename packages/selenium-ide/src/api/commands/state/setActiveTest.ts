import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import loadingID from 'api/constants/loadingID'
import { hasID } from 'api/helpers/hasID'
import { TestShape } from '@seleniumhq/side-model'

export type Shape = (testID: string) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [activeTestID] }
) => {
  const activeTest = session.project.tests.find(hasID(activeTestID)) as TestShape
  const activeCommandID = activeTest.commands[0]?.id ?? loadingID
  return {
    ...session,
    state: {
      ...session.state,
      activeTestID,
      activeCommandID,
    },
  }
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
