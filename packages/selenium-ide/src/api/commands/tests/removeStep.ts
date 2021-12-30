import { TestShape } from '@seleniumhq/side-model'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { CoreSessionData } from 'api/types'

export type Shape = Session['tests']['removeStep']

export function mutator(
  session: CoreSessionData,
  testID: string,
  stepID: string
) {
  const test = session.project.tests.find(
    (test) => test.id === testID
  ) as TestShape
  const index = test.commands.findIndex((step) => step.id === stepID)
  test.commands.splice(index, 1)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
