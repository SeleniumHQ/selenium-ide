import {
  codeExport as exporter,
  generateHooks,
  LanguageEmitterOpts,
  languageFromOpts,
} from 'side-code-export'
import emitter from './command'
import location from './location'
import hooks from './hook'

export const displayName = 'JavaScript New Relic Synthetics'

export const opts: LanguageEmitterOpts = {
  emitter: emitter,
  displayName,
  name: 'javascript-newrelic-synthetics',
  hooks: generateHooks(hooks),
  fileExtension: '.js',
  commandPrefixPadding: '  ',
  terminatingKeyword: '})',
  commentPrefix: '//',
  generateMethodDeclaration: function generateMethodDeclaration(name: string) {
    return `// method declaration ${name}`
  },
  // Create generators for dynamic string creation of primary entities (e.g., filename, methods, test, and suite)
  generateTestDeclaration: function generateTestDeclaration(name: string) {
    return `// test declaration ${name}`
  },
  generateSuiteDeclaration: function generateSuiteDeclaration(name) {
    return `// suite declaration ${name}`
  },
  generateFilename: function generateFilename(name) {
    return `${exporter.parsers.uncapitalize(
      exporter.parsers.sanitizeName(name)
    )}${opts.fileExtension}`
  },
}

export default languageFromOpts(opts, location.emit)
