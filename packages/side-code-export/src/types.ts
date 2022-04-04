import {
  CommandShape,
  ProjectShape,
  SuiteShape,
  TestShape,
} from '@seleniumhq/side-model'

import Hook from './code-export/hook'

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

export interface HookProps {
  startingSyntax: ExportCommandsShape
  endingSyntax: ExportCommandsShape
  registrationLevel: number
}

export type EmitterExtra = () => {
  name: string
  commands: ExportCommandShape[]
  generateMethodDeclaration: (name: string) => string
}

export type PrebuildEmitter = (target: string, value: string) => Promise<string>
export interface LanguageEmitterOpts {
  emitter: {
    canEmit: (command: CommandShape) => boolean
    emit: (command: CommandShape) => ExportCommandShape | ExportCommandsShape
    extras?: Record<string, EmitterExtra>
    emitters: Record<string, PrebuildEmitter>
    register: (command: CommandShape, emitter: any) => void
  }
  hooks: LanguageHookEmitters
  fileExtension: string
  commandPrefixPadding: string
  terminatingKeyword: string
  commentPrefix: string
  generateMethodDeclaration: (name: string) =>
    | string
    | {
        body: string
        terminatingKeyword: string
      }
  generateSuiteDeclaration: (name: string) => string
  generateTestDeclaration: (name: string) => string
  generateFilename: (name: string) => string
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
export type EmitTest = (opts: EmitTestOptions) => {
  filename: string
  body: string
}

export interface EmitSuiteOptions extends Omit<EmitTestOptions, 'test'> {
  suite: SuiteShape
}

// Emit a suite with all of its tests
export type EmitSuite = (opts: EmitSuiteOptions) => {
  filename: string
  body: string
}

export interface HookFunctionInputs {
  startingSyntax: ExportCommandsShape
  endingSyntax: ExportCommandsShape
  registrationLevel: number
}

export type HookFunction = () => HookFunctionInputs

export interface LanguageHookEmitters {
  afterAll?: HookFunction
  afterEach?: HookFunction
  beforeAll?: HookFunction
  beforeEach?: HookFunction
  declareDependencies: HookFunction
  declareMethods: HookFunction
  declareVariables: HookFunction
  inEachBegin: HookFunction
  inEachEnd: HookFunction
}

export interface LanguageHooks {
  afterAll: Hook
  afterEach: Hook
  beforeAll: Hook
  beforeEach: Hook
  declareDependencies: Hook
  declareMethods: Hook
  declareVariables: Hook
  inEachBegin: Hook
  inEachEnd: Hook
}

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

export interface LanguageEmitter {
  displayName: string
  emit: {
    test: EmitTest
    suite: EmitSuite
    locator: {
      id: LocationEmitter
      name: LocationEmitter
      link: LocationEmitter
      linkText: LocationEmitter
      partialLinkText: LocationEmitter
      css: LocationEmitter
      xpath: LocationEmitter
    }
    command: LanguageEmitterOpts['emitter']['emit']
  }
  emitSuite: EmitSuite
  emitTest: EmitTest
  opts: LanguageEmitterOpts
  register: LanguageEmitterRegister
}
