import merge from 'lodash/fp/merge'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { CommandShape, CoreSessionData, Mutator, TestShape } from 'api/types'

export type Shape = Session['tests']['updateStep']

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [testID, stepID, step] }
) =>
  update(
    'project.tests',
    (tests: TestShape[]) => {
      const testIndex = tests.findIndex((test) => test.id === testID)
      return update(
        `${testIndex}.commands`,
        (commands: CommandShape[]) => {
          const stepIndex = commands.findIndex((step) => step.id === stepID)
          return merge(commands[stepIndex], step)
        },
        tests
      )
    },
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
