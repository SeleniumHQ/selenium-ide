import { CommandShape, TestShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['tests']['addStep']

export const browser = browserHandler<Shape>()

export const mutator: Mutator<Shape> = (session, { params: [testID, index] }) =>
  update(
    'project.tests',
    (tests: TestShape[]) => {
      const testIndex = tests.findIndex((test) => test.id === testID)
      return update(
        `${testIndex}.commands`,
        (commands: CommandShape[]) => commands.slice(0).splice(index, 0),
        tests
      )
    },
    session
  )

export const main = mainHandler<Shape>()
