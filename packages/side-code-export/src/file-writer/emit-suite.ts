import { ProjectShape, SuiteShape } from '@seleniumhq/side-model'
import { LanguageEmitter } from '../types'

export async function emitSuite(
  format: LanguageEmitter,
  project: ProjectShape,
  suiteName: string
) {
  return format.emit.suite({
    baseUrl: project.url,
    beforeEachOptions: {},
    enableDescriptionAsComment: true,
    enableOriginTracing: false,
    project,
    suite: project.suites.find((s) => s.name === suiteName) as SuiteShape,
    tests: project.tests,
  })
}
