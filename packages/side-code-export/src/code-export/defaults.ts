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
      const testDeclaration = opts.generateTestDeclaration(test.name)
      const testCompletion =
        opts.generateTestCompletion?.(test.name) ?? opts.terminatingKeyword
      const result = await emit.test(test, tests, {
        ...opts,
        testDeclaration,
        testCompletion,
        enableOriginTracing,
        enableDescriptionAsComment,
        project,
      })
      const suiteName = test.name
      const suiteDeclaration = opts.generateSuiteDeclaration(suiteName)
      const suiteCompletion =
        opts.generateSuiteCompletion?.(suiteName) ?? opts.terminatingKeyword
      var _suite = await emit.suite(result, tests, {
        ...opts,
        suiteDeclaration,
        suiteCompletion,
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
        generateTestCompletion: opts.generateTestCompletion,
        generateTestDeclaration: opts.generateTestDeclaration,
        project,
      })
      const suiteDeclaration = opts.generateSuiteDeclaration(suite.name)
      const suiteCompletion =
        opts.generateSuiteCompletion?.(suite.name) ?? opts.terminatingKeyword
      var _suite = await emit.suite(result, tests, {
        ...opts,
        suiteDeclaration,
        suiteCompletion,
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
