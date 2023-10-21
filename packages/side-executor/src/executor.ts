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

import { Capabilities } from 'selenium-webdriver'
import { CommandShape } from '@seleniumhq/side-model'
import { Fn } from '@seleniumhq/side-commons'

export type ExpandedCapabilities = Partial<Capabilities> & {
  browserName: string
  'goog:chromeOptions'?: Record<string, boolean | number | string | string[]>
}
const DEFAULT_CAPABILITIES: ExpandedCapabilities = {
  browserName: 'chrome',
}

const state = Symbol('state')

export interface BaseExecutorConstructorArgs {
  capabilities?: ExpandedCapabilities
  hooks?: BaseExecutorHooks
  implicitWait?: number
  server?: string
}

export interface BaseExecutorInitOptions {
  baseUrl: string
  logger: Console
}

export interface BeforePlayHookInput {
  driver: BaseExecutor
}

export interface CommandHookInput {
  command: CommandShape
}

export type GeneralHook<T> = (input: T) => Promise<void> | void

export interface BaseExecutorHooks {
  onBeforePlay?: GeneralHook<BeforePlayHookInput>
  onAfterCommand?: GeneralHook<CommandHookInput>
  onBeforeCommand?: GeneralHook<CommandHookInput>
  onWindowAppeared?: GeneralHook<{
    command: CommandShape
    windowHandleName: string
  }>
}

export type HookKeys = keyof BaseExecutorHooks

export interface ElementEditableScriptResult {
  enabled: boolean
  readonly: boolean
}

export interface ScriptShape {
  script: string
  argv: any[]
}

export default class BaseExecutor<COMMAND_TYPE = Fn> {
  constructor({
    capabilities,
    server,
    hooks = {},
    implicitWait,
  }: BaseExecutorConstructorArgs) {
    this.capabilities = capabilities || DEFAULT_CAPABILITIES
    this.server = server
    this.implicitWait = implicitWait || 5 * 1000
    this.hooks = hooks
  }
  baseUrl?: string
  cancellable?: { cancel: () => void }
  capabilities?: ExpandedCapabilities
  commands: Record<string, COMMAND_TYPE> = {}
  server?: string
  windowHandle?: string
  hooks: BaseExecutorHooks
  implicitWait: number
  logger?: Console;
  [state]?: any

  async init({ baseUrl, logger }: BaseExecutorInitOptions) {
    this.baseUrl = baseUrl
    this.logger = logger
    this[state] = {}
  }

  async cancel() {
    if (this.cancellable) {
      await this.cancellable.cancel()
    }
  }

  async cleanup() {}

  name(command: string) {
    if (!command) {
      return 'skip'
    }

    if (this.commands[command]) {
      return command
    }
    throw new Error(`Unknown command ${command}`)
  }

  async executeHook<T extends HookKeys>(
    hook: T,
    ...args: Parameters<NonNullable<BaseExecutorHooks[T]>>
  ) {
    type HookContents = BaseExecutorHooks[T]
    type HookParameters = Parameters<NonNullable<HookContents>>
    const fn = this.hooks[hook] as HookContents
    if (!fn) return
    // @ts-expect-error it's okay, this shape is fine
    await fn.apply(this, args as HookParameters)
  }

  async beforeCommand(commandObject: CommandShape) {
    await this.executeHook('onBeforeCommand', { command: commandObject })
  }

  async afterCommand(commandObject: CommandShape) {
    this.cancellable = undefined
    if (commandObject.opensWindow) {
      await this.executeHook('onWindowAppeared', {
        command: commandObject,
        windowHandleName: commandObject.windowHandleName!,
      })
    }

    await this.executeHook('onAfterCommand', { command: commandObject })
  }

  // Commands go after this line
  async skip() {
    return Promise.resolve()
  }
}
