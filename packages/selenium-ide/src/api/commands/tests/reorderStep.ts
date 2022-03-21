import { CommandShape, TestShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { CoreSessionData, Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { hasID } from 'api/helpers/hasID'

export type Shape = (
  testID: string,
  oldIndex: number,
  newIndex: number
) => Promise<void>

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [testID, oldIndex, newIndex] }
) =>
  update(
    'project.tests',
    (tests: TestShape[]) => {
      const testIndex = tests.findIndex(hasID(testID))
      return update(
        `${testIndex}.commands`,
        (commands: CommandShape[]) => {
          const newCommands = commands.slice(0)
          const [step] = newCommands.splice(oldIndex, 1)
          newCommands.splice(newIndex, 0, step)
          return newCommands
        },
        tests
      )
    },
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
