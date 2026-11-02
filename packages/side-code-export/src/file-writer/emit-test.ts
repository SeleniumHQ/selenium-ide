import { ProjectShape, TestShape } from '@seleniumhq/side-model'
import { LanguageEmitter } from '../types'

export async function emitTest(
  format: LanguageEmitter,
  project: ProjectShape,
  // The test itself, or its ID. A name still works, but names may repeat.
  test: TestShape | string
) {
  return format.emit.test({
    baseUrl: project.url,
    beforeEachOptions: {},
    enableDescriptionAsComment: true,
    enableOriginTracing: false,
    project,
    test: findTest(project, test),
    tests: project.tests,
  })
}

function findTest(project: ProjectShape, test: TestShape | string) {
  if (typeof test !== 'string') return test
  const found =
    project.tests.find((item) => item.id === test) ||
    project.tests.find((item) => item.name === test)
  if (!found) throw new Error(`Test '${test}' not found`)
  return found
}
