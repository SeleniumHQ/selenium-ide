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

import { interpolateScript } from '../preprocessors'
import { ControlFlowCommandChecks } from './commands'

export class CommandNode {
  constructor(command) {
    this.command = command
    this.next = undefined
    this.left = undefined
    this.right = undefined
    this.index
    this.level
    this.timesVisited = 0
  }

  isExtCommand(executor) {
    return !!(
      typeof executor.isExtCommand === 'function' &&
      executor.isExtCommand(this.command.command)
    )
  }

  isControlFlow() {
    return !!(this.left || this.right)
  }

  isTerminal() {
    return (
      ControlFlowCommandChecks.isTerminal(this.command) ||
      this.command.command === ''
    )
  }

  isDisabled() {
    return this.command.command.startsWith('//')
  }

  execute(commandExecutor, args) {
    if (this._isRetryLimit()) {
      return Promise.reject(
        new Error(
          'Max retry limit exceeded. To override it, specify a new limit in the value input field.'
        )
      )
    }
    if (this.isDisabled()) {
      return Promise.resolve(this._executionResult())
    }
    return commandExecutor.beforeCommand(this.command).then(() => {
      return this._executeCommand(commandExecutor, args).then(result => {
        return commandExecutor.afterCommand(this.command).then(() => {
          return this._executionResult(result)
        })
      })
    })
  }

  _executeCommand(commandExecutor, { executorOverride } = {}) {
    if (executorOverride) {
      return executorOverride(this.command.target, this.command.value)
    } else if (this.isControlFlow()) {
      return this._evaluate(commandExecutor)
    } else if (this.isTerminal()) {
      return Promise.resolve()
    } else {
      return commandExecutor[commandExecutor.name(this.command.command)](
        this.command.target,
        this.command.value,
        this.command.targets
      )
    }
  }

  _executionResult(result) {
    this._incrementTimesVisited()
    return {
      next: this.isControlFlow() ? result.next : this.next,
    }
  }

  _evaluate(commandExecutor) {
    let expression = interpolateScript(
      this.command.target,
      commandExecutor.variables
    )
    if (ControlFlowCommandChecks.isTimes(this.command)) {
      const number = Math.floor(+expression)
      if (isNaN(number)) {
        return Promise.reject(new Error('Invalid number provided as a target.'))
      }
      expression = {
        script: `${this.timesVisited} < ${number}`,
      }
    }
    return commandExecutor.evaluateConditional(expression).then(result => {
      return this._evaluationResult(result)
    })
  }

  _evaluationResult(result) {
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
      let value = Math.floor(+this.command.value)
      if (this.command.value && !isNaN(value)) {
        limit = value
      }
      return this.timesVisited >= limit
    }
  }
}
