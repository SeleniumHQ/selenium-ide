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

import { xlateArgument } from "../../IO/SideeX/formatCommand";
import { ControlFlowCommandChecks } from "../../models/Command";
import { canExecuteCommand, executeCommand } from "../../../plugin/commandExecutor";

export class CommandNode {
  constructor(command) {
    this.command = command;
    this.next = undefined;
    this.left = undefined;
    this.right = undefined;
    this.index;
    this.level;
    this.timesVisited = 0;
  }

  isControlFlow() {
    return !!(this.left || this.right);
  }

  isValid() {
    return !!(this.command.command || this.command.comment);
  }

  isJustAComment() {
    return !!(!this.command.command && this.command.comment);
  }

  isTerminalKeyword() {
    return ControlFlowCommandChecks.isTerminal(this.command);
  }

  execute(extCommand, options) {
    if (this._isRetryLimit()) {
      return Promise.resolve({
        result: "Max retry limit exceeded. To override it, specify a new limit in the value input field."
      });
    }
    return this._executeCommand(extCommand, options).then((result) => {
      return this._executionResult(extCommand, result);
    });
  }

  _executeCommand(extCommand, options) {
    if (extCommand.isExtCommand(this.command.command)) {
      return extCommand[extCommand.name(this.command.command)](
        xlateArgument(this.command.target),
        xlateArgument(this.command.value));
    } else if (this.isControlFlow()) {
      return this._evaluate(extCommand);
    } else if (this.command.command === "type") {
      return extCommand.doType(
        xlateArgument(this.command.target),
        xlateArgument(this.command.value),
        extCommand.isWindowMethodCommand(this.command.command));
    } else if (canExecuteCommand(this.command.command)) {
      return executeCommand(
        this.command.command,
        this.command.target,
        this.command.value,
        options);
    } else if (this.isValid()) {
      if (this.isJustAComment() || this.isTerminalKeyword()) {
        return Promise.resolve({
          result: "success"
        });
      } else {
        return extCommand.sendMessage(
          this.command.command,
          xlateArgument(this.command.target),
          xlateArgument(this.command.value),
          extCommand.isWindowMethodCommand(this.command.command));
      }
    } else {
      return Promise.resolve({
        result: "Incomplete or unsupported command used."
      });
    }
  }

  _executionResult(extCommand, result) {
    if (extCommand.isExtCommand(this.command.command)) {
      return {
        next: this.command.command !== "run" ? this.next : result
      };
    } else if (result.result === "success") {
      this._incrementTimesVisited();
      return {
        result: "success",
        next: this.isControlFlow() ? result.next : this.next
      };
    } else if (canExecuteCommand(this.command.command)) {
      let _result = { ...result };
      _result.next = this.next;
      return _result;
    } else {
      if (this.command.command.match(/^verify/)) {
        return {
          result: result.result,
          next: this.next
        };
      } else {
        return result;
      }
    }
  }

  _evaluate(extCommand) {
    let expression = xlateArgument(this.command.target);
    if (ControlFlowCommandChecks.isTimes(this.command)) {
      const number = Math.floor(+expression);
      if (isNaN(number)) {
        return Promise.resolve({
          result: "Invalid number provided as a target."
        });
      }
      expression = `${this.timesVisited} < ${number}`;
    }
    return (extCommand.sendMessage("evaluateConditional", expression, "", false))
      .then((result) => {
        return this._evaluationResult(result);
      });
  }

  _evaluationResult(result) {
    if (result.result === "success") {
      if (result.value) {
        return {
          result: "success",
          next: this.right
        };
      } else {
        return {
          result: "success",
          next: this.left
        };
      }
    } else {
      return result;
    }
  }

  _incrementTimesVisited() {
    if (ControlFlowCommandChecks.isLoop(this.command)) this.timesVisited++;
  }

  _isRetryLimit() {
    if (ControlFlowCommandChecks.isLoop(this.command)) {
      let limit = 1000;
      let value = Math.floor(+this.command.value);
      if (this.command.value && !isNaN(value)) {
        limit = value;
      }
      return (this.timesVisited >= limit);
    }
  }

}
