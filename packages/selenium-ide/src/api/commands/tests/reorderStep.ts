import { CommandShape, TestShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { CoreSessionData, Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'

export type Shape = Session['tests']['reorderStep']

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [testID, stepID, newIndex] }
) =>
  update(
    'project.tests',
    (tests: TestShape[]) => {
      const testIndex = tests.findIndex((test) => test.id === testID)
      return update(
        `${testIndex}.commands`,
        (commands: CommandShape[]) => {
          const index = commands.findIndex((step) => step.id === stepID)
          const newCommands = commands.slice(0)
          const [step] = newCommands.splice(index, 1)
          newCommands.splice(newIndex, 0, step)
          return newCommands
        },
        tests
      )
    },
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
