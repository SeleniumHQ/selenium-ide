import { ProjectShape, SuiteShape } from '@seleniumhq/side-model'
import { LanguageEmitter } from '../types'

export async function emitSuite(
  format: LanguageEmitter,
  project: ProjectShape,
  // The suite itself, or its ID. A name still works, but names may repeat.
  suite: SuiteShape | string
) {
  return format.emit.suite({
    baseUrl: project.url,
    beforeEachOptions: {},
    enableDescriptionAsComment: true,
    enableOriginTracing: false,
    project,
    suite: findSuite(project, suite),
    tests: project.tests,
  })
}

function findSuite(project: ProjectShape, suite: SuiteShape | string) {
  if (typeof suite !== 'string') return suite
  const found =
    project.suites.find((item) => item.id === suite) ||
    project.suites.find((item) => item.name === suite)
  if (!found) throw new Error(`Suite '${suite}' not found`)
  return found
}
