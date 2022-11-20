import {
  CommandShape,
  ProjectShape,
  SuiteShape,
  TestShape,
} from '@seleniumhq/side-model'
import { ExportFlexCommandShape, VariableLookup } from './code-export'

import Hook, { LanguageHooks } from './code-export/hook'

export type LanguageExportExtras = {
  emitWaitForWindow: () => Promise<{
    name: string
    commands: ExportCommandShape[]
    generateMethodDeclaration: (name: string) =>
      | string
      | {
          body: string
          terminatingKeyword: string
        }
  }>
  emitNewWindowHandling: (
    command: CommandShape,
    emittedCommand: string
  ) => Promise<ExportFlexCommandShape>
}

export interface ExportCommandFormat {
  emitters: Record<string, PrebuildEmitter>
  variableLookup: VariableLookup
  variableSetter: (name: string, value: any) => string
  emit: (command: CommandShape) => string
  register: (command: CommandShape) => void
  extras: LanguageExportExtras
}
export interface ExportLocationFormat {
  emit: (location: string) => Promise<string>
}
export interface ExportFormat {
  Command: ExportCommandFormat
  location: ExportLocationFormat
  opts: {
    name?: string
    fileExtension?: string
    commandPrefixPadding?: string
    terminatingKeyword?: string
    commentPrefix?: string
  }
}

export type ExportCommandShape = { level: number; statement: string } | string
export type ExportCommandsShape = {
  commands: ExportCommandShape[]
  endingLevelAdjustment?: number
  skipEmitting?: boolean
  startingLevelAdjustment?: number
}
export type ExportCommandFactory = (opts: any) => ExportCommandsShape

export interface EmitOptions {
  isOptional?: boolean
  test?: TestShape
  suite?: SuiteShape
  tests: TestShape[]
  project: ProjectShape
  startingSyntaxOptions?: any
}

export type PrebuildEmitter = (
  target: string,
  value: string
) => Promise<ExportFlexCommandShape>

export type LanguageExportEmitterEmit = (
  command: CommandShape
) => Promise<ExportFlexCommandShape> | ExportFlexCommandShape

export type LanguageExportEmitter = {
  emit: LanguageExportEmitterEmit
  extras: ExportCommandFormat['extras']
  emitters: Record<string, PrebuildEmitter>
  register: (command: string, emitter: PrebuildEmitter) => void
}

export interface LanguageEmitterOpts {
  commentPrefix: string
  commandPrefixPadding: string
  emitter: LanguageExportEmitter
  fileExtension: string
  generateFilename: (name: string) => string
  generateMethodDeclaration: (name: string) =>
    | string
    | {
        body: string
        terminatingKeyword: string
      }
  generateSuiteDeclaration: (name: string) => string
  generateTestDeclaration: (name: string) => string
  hooks: LanguageHooks
  terminatingKeyword: string
}

export interface EmitTestOptions {
  baseUrl: string
  test: TestShape
  tests: TestShape[]
  project: ProjectShape
  enableOriginTracing: boolean
  beforeEachOptions: any
  enableDescriptionAsComment: boolean
}

// Emit an individual test, wrapped in a suite (using the test name as the suite name)
export type EmitTest = (opts: EmitTestOptions) => Promise<{
  filename: string
  body: string
}>

export interface EmitSuiteOptions extends Omit<EmitTestOptions, 'test'> {
  suite: SuiteShape
}

// Emit a suite with all of its tests
export type EmitSuite = (opts: EmitSuiteOptions) => Promise<{
  filename: string
  body: string
}>

export interface LanguageEmitterRegister {
  command: LanguageEmitterOpts['emitter']['register']
  variable: Hook['register']
  dependency: Hook['register']
  beforeAll: Hook['register']
  beforeEach: Hook['register']
  afterEach: Hook['register']
  afterAll: Hook['register']
  inEachBegin: Hook['register']
  inEachEnd: Hook['register']
}

export type LocationEmitter = (selector: string) => Promise<string>

export type LanguageEmitterEmitLocator = {
  id: LocationEmitter
  name: LocationEmitter
  link: LocationEmitter
  linkText: LocationEmitter
  partialLinkText: LocationEmitter
  css: LocationEmitter
  xpath: LocationEmitter
}

export type LanguageEmitterEmit = {
  test: EmitTest
  suite: EmitSuite
  locator: (locator: string) => Promise<string>
  command: LanguageEmitterOpts['emitter']['emit']
}

export interface LanguageEmitter {
  emit: LanguageEmitterEmit
  register: LanguageEmitterRegister
}
