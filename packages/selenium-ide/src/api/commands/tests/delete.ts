import { ProjectShape } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'

export type Shape = Session['tests']['delete']

export function mutator(project: ProjectShape, testID: string) {
  project.suites.forEach((suite) => {
    while (suite.tests.includes(testID)) {
      const index = suite.tests.indexOf(testID)
      suite.tests.splice(index, 1)
    }
  })
  const index = project.tests.findIndex((test) => test.id === testID)
  project.tests.splice(index, 1)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
