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

import { Fn } from '@seleniumhq/side-commons'
import { CommandShape } from '@seleniumhq/side-model'
import { WebDriverExecutor } from '..'
import { interpolateScript, interpolateString } from '../preprocessors'
import { CommandNodeOptions } from '../types'
import Variables from '../variables'
import { WebDriverExecutorCondEvalResult } from '../webdriver'
import { ControlFlowCommandChecks } from './commands'

export interface CommandExecutorOptions {
  executorOverride?: Fn
}

export interface CommandExecutionResult {
  next?: CommandNode
  skipped?: boolean
  value?: any
}

export class CommandNode {
  constructor(
    command: CommandShape,
    { emitControlFlowChange }: CommandNodeOptions = {}
  ) {
    this.command = command
    this.next = undefined
    this.left = undefined
    this.right = undefined
    this.index = 0
    this.level = 0
    this.timesVisited = 0
    this.emitControlFlowChange = emitControlFlowChange
      ? emitControlFlowChange
      : () => {}
  }
  command: CommandShape
  emitControlFlowChange: Fn
  next?: CommandNode
  transientError?: string
  left?: CommandNode
  right?: CommandNode
  index: number
  level: number
  timesVisited: number

  /* I'm not sure what this does yet, so I'm putting it on a shelf atm
  isExtCommand(executor: CommandNode): boolean {
    return !!(
      typeof executor.isExtCommand === 'function' &&
      executor.isExtCommand(this.command.command)
    )
  }
  */

  isControlFlow(): boolean {
    return !!(this.left || this.right)
  }

  isTerminal(): boolean {
    return (
      ControlFlowCommandChecks.isTerminal(this.command) ||
      this.command.command === ''
    )
  }

  shouldSkip(): boolean {
    return Boolean(this.command.skip || this.command.command.startsWith('//'))
  }

  async execute(
    commandExecutor: WebDriverExecutor,
    args?: CommandExecutorOptions
  ) {
    if (this._isRetryLimit()) {
      throw new Error(
        'Max retry limit exceeded. To override it, specify a new limit in the value input field.'
      )
    }
    if (this.shouldSkip()) {
      return this._executionResult({ skipped: true })
    }
    await commandExecutor.beforeCommand(this.command)
    const result = await this._executeCommand(commandExecutor, args)
    await commandExecutor.afterCommand(this.command)
    return this._executionResult(result)
  }

  async _executeCommand(
    commandExecutor: WebDriverExecutor,
    { executorOverride }: CommandExecutorOptions = {}
  ) {
    if (executorOverride) {
      return await executorOverride(this.command.target, this.command.value)
    } else if (this.isControlFlow()) {
      return this._evaluate(commandExecutor)
    } else if (this.isTerminal()) {
      return
    } else {
      const { command } = this
      const { target, value } = command
      const commandName = command.command
      const customCommand = commandExecutor.customCommands[commandName]
      const existingCommandName = commandExecutor.name(commandName)
      // @ts-expect-error webdriver is too kludged by here
      if (!customCommand && !commandExecutor[existingCommandName]) {
        throw new Error(`Missing expected command type ${commandName}`)
      }
      const executor = customCommand
        ? () => customCommand.execute(command, commandExecutor)
        : // @ts-expect-error webdriver is too kludged by here
          () => commandExecutor[existingCommandName](target, value, commandName)
      const ignoreRetry =
        commandName === 'pause' || commandName.startsWith('wait')
      if (ignoreRetry) {
        return executor()
      }
      return this.retryCommand(
        executor,
        Date.now() + commandExecutor.implicitWait
      )
    }
  }

  async pauseTimeout(timeout?: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeout))
  }

  async retryCommand(
    execute: () => Promise<unknown>,
    timeout: number
  ): Promise<unknown> {
    const timeLimit = timeout - Date.now()
    const expirationTimer = setTimeout(() => {
      throw new Error(
        `Operation timed out running command ${this.command.command}:${this.command.target}:${this.command.value}`
      )
    }, timeLimit)
    try {
      const result = await execute()
      clearTimeout(expirationTimer)
      return result
    } catch (e) {
      clearTimeout(expirationTimer)
      this.handleTransientError(e, timeout)
      await this.pauseTimeout()
      return this.retryCommand(execute, timeout)
    }
  }

  _executionResult(result: CommandExecutionResult = {}) {
    this._incrementTimesVisited()
    return {
      next: this.isControlFlow() ? result.next : this.next,
      skipped: result.skipped,
    }
  }

  handleTransientError(e: unknown, timeout: number) {
    const { command, target, value } = this.command
    const thisCommand = `${command}-${target}-${value}`
    const thisErrorMessage = e instanceof Error ? e.message : ''
    const thisTransientError = `${thisCommand}-${thisErrorMessage}`
    const lastTransientError = this.transientError
    const isNewErrorMessage = lastTransientError !== thisTransientError
    const notRetrying = Date.now() > timeout
    if (isNewErrorMessage) {
      this.transientError = thisTransientError
      console.warn(
        'Unexpected error occured during command:',
        thisCommand,
        notRetrying ? '' : 'retrying...'
      )
      if (thisErrorMessage) {
        console.error(thisErrorMessage)
      }
    }

    if (notRetrying) {
      console.error('Command failure:', thisCommand)
      throw e
    }
  }

  evaluateForEach(variables: Variables): boolean | string {
    let collection = variables.get(
      interpolateScript(this.command.target as string, variables).script
    )
    if (!collection) return 'Invalid variable provided.'
    variables.set(
      interpolateScript(this.command.value as string, variables).script,
      collection[this.timesVisited]
    )
    const result = this.timesVisited < collection.length
    if (result)
      this.emitControlFlowChange({
        commandId: this.command.id,
        type: CommandType.LOOP,
        index: this.timesVisited,
        iterator: collection[this.timesVisited],
        collection,
      })
    // Reset timesVisited if loop ends, needed to support forEach recursion.
    // It's set to -1 since the incrementer will pick it up. Setting it to
    // 0 when called on a subsequent interation.
    else this.timesVisited = -1
    return result
  }

  _evaluate(commandExecutor: WebDriverExecutor) {
    if (ControlFlowCommandChecks.isTimes(this.command)) {
      const number = Math.floor(
        +interpolateString(`${this.command.target}`, commandExecutor.variables)
      )
      if (isNaN(number)) {
        return Promise.reject(new Error('Invalid number provided as a target.'))
      }
      return this._evaluationResult({ value: this.timesVisited < number })
    }
    let expression = interpolateScript(
      this.command.target as string,
      commandExecutor.variables
    )
    if (ControlFlowCommandChecks.isForEach(this.command)) {
      const result = this.evaluateForEach(commandExecutor.variables)
      if (!result) {
        this.emitControlFlowChange({
          commandId: this.command.id,
          type: CommandType.LOOP,
          end: true,
        })
      }
      return this._evaluationResult({
        value: Boolean(result),
      })
    }
    return commandExecutor.evaluateConditional(expression).then((result) => {
      return this._evaluationResult(result)
    })
  }

  _evaluationResult(result: WebDriverExecutorCondEvalResult) {
    if (result.value) {
      return {
        next: this.right,
      }
    } else {
      return {
        next: this.left,
      }
    }
  }

  _incrementTimesVisited() {
    if (ControlFlowCommandChecks.isLoop(this.command)) this.timesVisited++
  }

  _isRetryLimit() {
    if (ControlFlowCommandChecks.isLoop(this.command)) {
      let limit = 1000
      let value = Math.floor(+(this.command.value as string))
      if (this.command.value && !isNaN(value)) {
        limit = value
      }
      return this.timesVisited >= limit
    }
    return false
  }
}

export const CommandType = {
  LOOP: 'loop',
  CONDITIONAL: 'conditional',
} as const
