import emit from './emit'
import { LanguageEmitter, LanguageEmitterOpts, LocationEmitter } from '../types'

export const languageFromOpts = (
  opts: LanguageEmitterOpts,
  locationEmit: LocationEmitter
): LanguageEmitter => ({
  emit: {
    test: async function emitTest({
      test,
      tests,
      project,
      enableOriginTracing,
      beforeEachOptions,
      enableDescriptionAsComment,
    }) {
      // @ts-expect-error globals yuck
      global.baseUrl = baseUrl
      const testDeclaration = opts.generateTestDeclaration(test.name)
      const result = await emit.test(test, tests, {
        ...opts,
        testDeclaration,
        enableOriginTracing,
        enableDescriptionAsComment,
        project,
      })
      const suiteName = test.name
      const suiteDeclaration = opts.generateSuiteDeclaration(suiteName)
      var _suite = await emit.suite(result, tests, {
        ...opts,
        suiteDeclaration,
        suiteName,
        project,
        beforeEachOptions,
      })
      return {
        filename: opts.generateFilename(test.name),
        body: emit.orderedSuite(_suite),
      }
    },
    suite: async function emitSuite({
      suite,
      tests,
      project,
      enableOriginTracing,
      beforeEachOptions,
      enableDescriptionAsComment,
    }) {
      const result = await emit.testsFromSuite(tests, suite, opts, {
        enableOriginTracing,
        enableDescriptionAsComment,
        generateTestDeclaration: opts.generateTestDeclaration,
        project,
      })
      const suiteDeclaration = opts.generateSuiteDeclaration(suite.name)
      var _suite = await emit.suite(result, tests, {
        ...opts,
        suiteDeclaration,
        suite,
        suiteName: suite.name,
        project,
        beforeEachOptions,
      })
      return {
        filename: opts.generateFilename(suite.name),
        body: emit.orderedSuite(_suite),
      }
    },
    locator: locationEmit,
    command: opts.emitter.emit,
  },
  opts,
  register: {
    command: opts.emitter.register,
    variable: opts.hooks.declareVariables.register,
    dependency: opts.hooks.declareDependencies.register,
    beforeAll: opts.hooks.beforeAll.register,
    beforeEach: opts.hooks.beforeEach.register,
    afterEach: opts.hooks.afterEach.register,
    afterAll: opts.hooks.afterAll.register,
    inEachBegin: opts.hooks.inEachBegin.register,
    inEachEnd: opts.hooks.inEachEnd.register,
  },
})
