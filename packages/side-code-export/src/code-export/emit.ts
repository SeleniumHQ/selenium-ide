// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import stringEscape from '../string-escape'
import {
  Preprocessor,
  preprocessParameter,
  VariableLookup,
} from './preprocessor'
import doRender, { PartialRenderParameters } from './render'
import { registerMethod } from './register'
import { findReusedTestMethods, findCommandThatOpensWindow } from './find'
import {
  Commands,
  CommandShape,
  ProjectShape,
  SuiteShape,
  TestShape,
} from '@seleniumhq/side-model'
import {
  ExportCommandShape,
  ExportCommandsShape,
  LanguageEmitterOpts,
} from '../types'
import { writeCommands } from './utils'
import { LanguageHooks } from './hook'

export interface EmitterContext extends Omit<LanguageEmitterOpts, 'hooks'> {
  testLevel?: number
  commandLevel?: number
  suiteCompletion?: string
  suiteDeclaration?: string
  testCompletion?: string
  testDeclaration?: string
  enableOriginTracing: boolean
  enableDescriptionAsComment: boolean
  hooks: LanguageHooks
  project: ProjectShape
}

function validateCommand(command: CommandShape) {
  const commandName = command.command
  if (!commandName.startsWith('//')) {
    let commandSchema = Commands[commandName]
    if (!commandSchema) throw new Error(`Invalid command '${commandName}'`)
    if (!!commandSchema.target !== !!command.target) {
      const isOptional = commandSchema.target
        ? !!commandSchema.target.isOptional
        : true
      if (!isOptional) {
        throw new Error(
          `Incomplete command '${command.command}'. Missing expected target argument.`
        )
      }
    }
    if (!!commandSchema.value !== !!command.value) {
      const isOptional = commandSchema.value
        ? !!commandSchema.value.isOptional
        : true
      if (!isOptional) {
        throw new Error(
          `Incomplete command '${commandName}'. Missing expected value argument.`
        )
      }
    }
  }
}

export type ExportFlexCommandShape = ExportCommandShape | ExportCommandsShape

export interface EmitCommandContext {
  context: EmitterContext
  emitNewWindowHandling: (
    command: CommandShape,
    result: ExportFlexCommandShape,
    context: EmitterContext
  ) => Promise<ExportFlexCommandShape>
  variableLookup: VariableLookup
}

export interface ProcessedCommandEmitter {
  (
    target: any | undefined,
    value: any | undefined,
    context: EmitterContext
  ): Promise<ExportFlexCommandShape>
  targetPreprocessor?: Preprocessor
  valuePreprocessor?: Preprocessor
}

export function baseEmitFactory(
  command: CommandShape,
  emitter: ProcessedCommandEmitter,
  { variableLookup, emitNewWindowHandling }: EmitCommandContext
) {
  return async function emit(
    target: any | undefined,
    value: any | undefined,
    context: EmitterContext
  ): Promise<ExportFlexCommandShape> {
    validateCommand(command)
    let _target = target
    let _value = value
    if (emitter.targetPreprocessor) {
      _target = await emitter.targetPreprocessor(target, variableLookup)
    }
    if (emitter.valuePreprocessor) {
      _value = await emitter.valuePreprocessor(value, variableLookup)
    }
    const result = await emitter(_target, _value, context)
    return emitNewWindowHandling(command, result, context)
  }
}

export async function emitCommand(
  command: CommandShape,
  emitter: ProcessedCommandEmitter,
  { context, emitNewWindowHandling, variableLookup }: EmitCommandContext
) {
  validateCommand(command)
  if (emitter) {
    const ignoreEscaping = command.command === 'storeJson'
    let result = await emitter(
      preprocessParameter(
        command.target as string,
        emitter.targetPreprocessor,
        variableLookup,
        { ignoreEscaping }
      ),
      preprocessParameter(
        command.value as string,
        emitter.valuePreprocessor,
        variableLookup,
        { ignoreEscaping }
      ),
      context
    )
    if (command.opensWindow) {
      return await emitNewWindowHandling(command, result, context)
    }
    return result
  }
  return ''
}

export type StringEmitter = (selector: string) => Promise<string>
export interface LocationEmitters {
  id: StringEmitter
  name: StringEmitter
  link: StringEmitter
  linkText: StringEmitter
  partialLinkText: StringEmitter
  css: StringEmitter
  xpath: StringEmitter
}

export function emitLocation(location: string, emitters: LocationEmitters) {
  if (/^\/\//.test(location)) {
    return emitters.xpath(location)
  }
  const fragments = location.split('=')
  const type = fragments.shift() as keyof LocationEmitters
  const selector = fragments.join('=')
  if (emitters[type]) {
    return emitters[type](selector)
  } else {
    throw new Error(type ? `Unknown locator ${type}` : "Locator can't be empty")
  }
}

export interface SelectionEmitters {
  id: StringEmitter
  value: StringEmitter
  label: StringEmitter
  index: StringEmitter
}

export function emitSelection(location: string, emitters: SelectionEmitters) {
  if (!location) throw new Error(`Location can't be empty`)
  const [type, selector] = location.split('=') as [
    keyof SelectionEmitters,
    string
  ]
  if (emitters[type] && selector) {
    let result = emitters[type](selector)
    return result
  } else if (!selector) {
    // no selector strategy given, assuming label
    return emitters['label'](type)
  } else {
    throw new Error(`Unknown selection locator ${type}`)
  }
}

async function emitCommands(commands: CommandShape[], context: EmitterContext) {
  const { emitter } = context
  const emittedCommands = await Promise.all(
    commands.map((command) => {
      try {
        return emitter.emit(command, context)
      } catch (e) {
        throw new Error(
          `Error while emitting command ${command.command}|${command.target}|${
            command.value
          }: ${(e as Error).message}`
        )
        //  throw e
      }
    })
  )
  let result: ExportCommandShape[] = []
  emittedCommands.forEach((entry) => {
    if (typeof entry === 'string') {
      entry.split('\n').forEach((subEntry) => result.push(subEntry))
    } else {
      if ('statement' in entry) {
        result.push(entry)
      } else if ('commands' in entry) {
        result = result.concat(entry.commands)
      }
    }
  })
  return result
}

export interface EmitMethodContext {
  context: EmitterContext
  level: number
  render: any
  overrideCommandEmitting?: boolean
}

export interface MethodShape {
  name: string
  generateMethodDeclaration?: LanguageEmitterOpts['generateMethodDeclaration']
  commands: ExportCommandShape[] | CommandShape[]
}

export interface NonOverrideMethodShape {
  name: string
  commands: ExportCommandShape[]
}

async function emitMethod(
  method: MethodShape,
  { context, level, render, overrideCommandEmitting = false }: EmitMethodContext
) {
  const {
    commandPrefixPadding,
    generateMethodDeclaration,
    terminatingKeyword,
  } = context
  const methodDeclaration = method.generateMethodDeclaration
    ? method.generateMethodDeclaration(method.name)
    : generateMethodDeclaration(method.name)
  let _methodDeclaration = methodDeclaration
  let _terminatingKeyword = terminatingKeyword
  if (typeof methodDeclaration === 'object') {
    _methodDeclaration = methodDeclaration.body
    _terminatingKeyword = methodDeclaration.terminatingKeyword
  }
  let result: string
  if (overrideCommandEmitting) {
    result = writeCommands(method as NonOverrideMethodShape, {
      commandPrefixPadding,
      level,
    })
  } else {
    result = render(
      await emitCommands(method.commands as CommandShape[], context),
      {
        newLineCount: 0,
        startingLevel: level,
      }
    )
    // Remove any trailing newlines on result to avoid double newlines.
    // Newlines get added when the final array elements are combined,
    // so any trailing newlines result in awkward empty lines.
    if (result.slice(-1) === '\n') {
      result = result.slice(0, -1)
    }
  }
  return [_methodDeclaration, result, _terminatingKeyword] as string[]
}

export function emitOriginTracing(
  test: TestShape,
  { commentPrefix }: Pick<EmitterContext, 'commentPrefix'>,
  enableOriginTracing: boolean,
  enableDescriptionAsComment: boolean
) {
  let result = []
  if (enableOriginTracing) {
    result.push(commentPrefix + ` Test name: ${test.name}`)
    let topRow = commentPrefix + ' Step # | name | target | value'
    if (!enableDescriptionAsComment) {
      topRow += ' | comment'
    }
    result.push(topRow)
  }
  test.commands.forEach((command, index) => {
    let row = ''
    if (enableOriginTracing) {
      row =
        commentPrefix +
        ` ${index + 1} | ${command.command} | ${command.target} | ${
          command.value
        }`
      if (enableDescriptionAsComment) {
        if (command.comment) {
          row += '\n'
        }
      } else {
        row += ` | ${command.comment}`
      }
    }
    if (enableDescriptionAsComment) {
      if (command.comment) {
        row += commentPrefix + ` ${command.comment}`
      }
    }
    result.push(row)
  })
  return result
}

export interface EmittedTest {
  testDeclaration: string
  inEachBegin: string
  commands: string
  inEachEnd: string
  testEnd: string
}

async function emitTest(
  test: TestShape,
  tests: TestShape[],
  context: EmitterContext
): Promise<EmittedTest> {
  const {
    testLevel = 1,
    commandLevel = 2,
    testCompletion,
    testDeclaration,
    terminatingKeyword,
    commandPrefixPadding,
    commentPrefix,
    hooks,
    emitter,
    generateMethodDeclaration,
    enableOriginTracing,
    enableDescriptionAsComment,
    project,
  } = context
  let result: Partial<EmittedTest> = {}
  const methods = findReusedTestMethods(test, tests)
  const render = (...args: PartialRenderParameters) =>
    doRender(commandPrefixPadding, ...args)

  // handle extra dynamic emitters that aren't tied to an explicit command
  if (emitter.extras) {
    for (const emitter_name in emitter.extras) {
      if (
        emitter_name === 'emitWaitForWindow' &&
        findCommandThatOpensWindow(test, tests)
      ) {
        const method = await emitter.extras[emitter_name]()
        const result = await emitMethod(method, {
          context,
          level: testLevel,
          render,
          overrideCommandEmitting: true,
        })
        await registerMethod(method.name, result, {
          generateMethodDeclaration: method.generateMethodDeclaration,
          hooks,
        })
      }
    }
  }

  // handle reused test methods (e.g., commands that use the `run` command)
  for (const method of methods) {
    const result = await emitMethod(method, {
      context,
      level: testLevel,
      render,
    })
    await registerMethod(method.name, result, {
      generateMethodDeclaration,
      hooks,
    })
  }

  // prepare origin tracing code commands if enabled
  const originTracing = emitOriginTracing(
    test,
    { commentPrefix },
    enableOriginTracing,
    enableDescriptionAsComment
  )

  // prepare result object
  result.testDeclaration = render(testDeclaration!, {
    startingLevel: testLevel,
  }) as string
  result.inEachBegin = render(
    await hooks.inEachBegin.emit({ test, tests, project, isOptional: true }),
    {
      startingLevel: commandLevel,
    }
  ) as string
  result.commands = render(
    {
      commands: await emitCommands(test.commands, context).catch((error) => {
        // prefix test name on error
        throw new Error(`Test '${test.name}' has a problem: ${error.message}`)
      }),
    },
    {
      startingLevel: commandLevel,
      originTracing,
      enableOriginTracing,
    }
  ) as string
  result.inEachEnd = render(
    await hooks.inEachEnd.emit({ test, tests, project, isOptional: true }),
    {
      startingLevel: commandLevel,
    }
  ) as string
  result.testEnd = render(testCompletion || terminatingKeyword, {
    startingLevel: testLevel,
  }) as string

  return result as EmittedTest
}

async function emitTestsFromSuite(
  tests: TestShape[],
  suite: SuiteShape,
  languageOpts: Omit<LanguageEmitterOpts, 'hooks'> & { hooks: LanguageHooks },
  {
    enableOriginTracing,
    enableDescriptionAsComment,
    generateTestCompletion,
    generateTestDeclaration,
    project,
  }: Pick<
    EmitterContext,
    | 'enableDescriptionAsComment'
    | 'enableOriginTracing'
    | 'generateTestCompletion'
    | 'generateTestDeclaration'
    | 'project'
  >
) {
  let result: Record<string, EmittedTest> = {}
  for (const testID of suite.tests) {
    const test = tests.find((test) => test.id === testID) as TestShape
    const testDeclaration = generateTestDeclaration(test.name)
    const testCompletion = generateTestCompletion
      ? generateTestCompletion(test.name)
      : languageOpts.terminatingKeyword
    result[test.name] = await emitTest(test, tests, {
      ...languageOpts,
      testDeclaration,
      testCompletion,
      enableOriginTracing,
      enableDescriptionAsComment,
      project,
    })
  }
  return result
}

export interface EmittedSuite {
  suiteDeclaration: string
  suiteCompletion?: string
  headerComment: string
  dependencies: string
  variables: string
  beforeAll: string
  beforeEach: string
  afterEach: string
  afterAll: string
  methods: string
  tests: Record<string, EmittedTest> | EmittedTest
  suiteEnd: string
}

async function emitSuite(
  body: EmittedSuite['tests'],
  tests: TestShape[],
  {
    beforeEachOptions,
    commentPrefix,
    commandPrefixPadding,
    hooks,
    suiteDeclaration,
    suiteCompletion,
    suiteLevel,
    suiteName,
    suite,
    project,
    terminatingKeyword,
    testLevel,
  }: Pick<
    EmitterContext,
    | 'commentPrefix'
    | 'commandPrefixPadding'
    | 'hooks'
    | 'project'
    | 'suiteCompletion'
    | 'terminatingKeyword'
  > & {
    beforeEachOptions?: any
    suite?: SuiteShape
    suiteDeclaration: string
    suiteLevel?: number
    suiteName: string
    testLevel?: number
  }
) {
  // preamble
  let result: Partial<EmittedSuite> = {}
  testLevel = testLevel || 1
  suiteLevel = suiteLevel || 0
  if (!suite) {
    suite = {
      id: '',
      name: suiteName,
      tests: [],
      timeout: 30000,
      parallel: false,
      persistSession: false,
    }
  }
  const render = (...args: PartialRenderParameters) =>
    doRender(commandPrefixPadding, ...args)

  // prepare result object
  result.headerComment = commentPrefix + ' Generated by Selenium IDE\n'
  result.dependencies = render(
    await hooks.declareDependencies.emit({ suite, tests, project }),
    {}
  ) as string
  result.suiteDeclaration = render(suiteDeclaration, {
    startingLevel: suiteLevel,
  }) as string
  result.variables = render(
    await hooks.declareVariables.emit({ suite, tests, project }),
    {
      startingLevel: testLevel,
    }
  ) as string
  result.beforeAll = render(
    await hooks.beforeAll.emit({ suite, tests, project, isOptional: true }),
    {
      startingLevel: testLevel,
    }
  ) as string
  result.beforeEach = render(
    await hooks.beforeEach.emit({
      suite,
      tests,
      project,
      startingSyntaxOptions: beforeEachOptions,
    }),
    {
      startingLevel: testLevel,
    }
  ) as string
  result.afterEach = render(
    await hooks.afterEach.emit({ suite, tests, project }),
    {
      startingLevel: testLevel,
    }
  ) as string
  result.afterAll = render(
    await hooks.afterAll.emit({ suite, tests, project, isOptional: true }),
    {
      startingLevel: testLevel,
    }
  ) as string
  result.methods = render(
    await hooks.declareMethods.emit({
      suite,
      tests,
      project,
      isOptional: true,
    }),
    {
      startingLevel: testLevel,
    }
  ) as string
  result.tests = body
  result.suiteEnd = render(suiteCompletion || terminatingKeyword, {
    startingLevel: suiteLevel,
  }) as string

  // cleanup
  hooks.declareMethods.clearRegister()

  return result as EmittedSuite
}

function emitOrderedSuite(emittedSuite: EmittedSuite) {
  let result = ''
  result += emittedSuite.headerComment
  result += emittedSuite.dependencies
  result += emittedSuite.suiteDeclaration
  result += emittedSuite.variables
  result += emittedSuite.beforeAll
  result += emittedSuite.beforeEach
  result += emittedSuite.afterEach
  result += emittedSuite.afterAll
  result += emittedSuite.methods
  if (emittedSuite.tests.testDeclaration) {
    const test = emittedSuite.tests
    result += test.testDeclaration
    result += test.inEachBegin
    result += test.commands
    result += test.inEachEnd
    result += test.testEnd
  } else {
    const tests = emittedSuite.tests as Record<string, EmittedTest>
    for (const testName in tests) {
      const test = tests[testName]
      result += test.testDeclaration
      result += test.inEachBegin
      result += test.commands
      result += test.inEachEnd
      result += test.testEnd
    }
  }
  result += emittedSuite.suiteEnd
  return result
}

export default {
  command: emitCommand,
  commands: emitCommands,
  location: emitLocation,
  method: emitMethod,
  selection: emitSelection,
  suite: emitSuite,
  orderedSuite: emitOrderedSuite,
  test: emitTest,
  text: stringEscape,
  testsFromSuite: emitTestsFromSuite,
}
