import { ProjectShape, TestShape } from '@seleniumhq/side-model'
import { LanguageEmitter } from '../types'

export async function emitTest(
  format: LanguageEmitter,
  project: ProjectShape,
  testName: string
) {
  console.log(format, project, testName)
  return format.emit.test({
    baseUrl: project.url,
    beforeEachOptions: {},
    enableDescriptionAsComment: true,
    enableOriginTracing: false,
    project,
    test: project.tests.find((t) => t.name === testName) as TestShape,
    tests: project.tests,
  })
}
