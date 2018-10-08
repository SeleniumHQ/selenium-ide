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

import { Commands, ArgTypes } from "../../models/Command";
import { xlateArgument, interpolateScript } from "../../IO/SideeX/formatCommand";
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

  isWebDriverCommand(executor) {
    return !!(typeof executor.isWebDriverCommand === "function" &&
      executor.isWebDriverCommand());
  }

  isExtCommand(executor) {
    return !!(typeof executor.isExtCommand === "function" &&
      executor.isExtCommand(this.command.command));
  }

  isControlFlow() {
    return !!(this.left || this.right);
  }

  isTerminal() {
    return ControlFlowCommandChecks.isTerminal(this.command) ||
      this.command.command === "" ||
      this.command.command.startsWith("//");
  }

  execute(commandExecutor, options, targetOverride) {
    if (this._isRetryLimit()) {
      return Promise.resolve({
        result: "Max retry limit exceeded. To override it, specify a new limit in the value input field."
      });
    }
    return this._executeCommand(commandExecutor, options, targetOverride).then((result) => {
      return this._executionResult(commandExecutor, result);
    });
  }

  _interpolateTarget(target) {
    const type = Commands.list.get(this.command.command).target;
    if (type && (type.name === ArgTypes.script.name ||
        type.name === ArgTypes.conditionalExpression.name)) {
      return interpolateScript(this.command.target);
    } else if (target) {
      return xlateArgument(target);
    }
    return xlateArgument(this.command.target);
  }

  _interpolateValue() {
    const type = Commands.list.get(this.command.command).value;
    if (type && type.name === ArgTypes.script.name) {
      return interpolateScript(this.command.value);
    }
    return xlateArgument(this.command.value);
  }

  _executeCommand(commandExecutor, options, targetOverride) {
    if (this.isControlFlow()) {
      return this._evaluate(commandExecutor);
    } else if (this.isTerminal()) {
      return Promise.resolve({
        result: "success"
      });
    } else if (this.isWebDriverCommand(commandExecutor) ||
               this.isExtCommand(commandExecutor)) {
      return commandExecutor[commandExecutor.name(this.command.command)](
        this._interpolateTarget(),
        this._interpolateValue()
      );
    } else if (canExecuteCommand(this.command.command)) {
      return executeCommand(
        this.command.command,
        this._interpolateTarget(targetOverride),
        this._interpolateValue(),
        options);
    } else if (this.command.command === "mouseOver") {
      return commandExecutor.doMouseOver(
        this._interpolateTarget(),
        this._interpolateValue()
      );
    } else if (this.command.command === "sendKeys") {
      return commandExecutor.doSendKeys(
        this._interpolateTarget(),
        this._interpolateValue()
      );
    } else if (this.command.command === "type") {
      return commandExecutor.doType(
        this._interpolateTarget(),
        this._interpolateValue(),
        commandExecutor.isWindowMethodCommand(this.command.command));
    } else {
      return commandExecutor.sendMessage(
        this.command.command,
        this._interpolateTarget(targetOverride),
        this._interpolateValue(),
        commandExecutor.isWindowMethodCommand(this.command.command));
    }
  }

  _executionResult(commandExecutor, result) {
    if (result && result.result === "success") {
      this._incrementTimesVisited();
      return {
        result: "success",
        next: this.isControlFlow() ? result.next : this.next
      };
    } else if (this.isWebDriverCommand(commandExecutor) ||
               this.isExtCommand(commandExecutor)) {
      return {
        next: this.command.command !== "run" ? this.next : result
      };
    } else if (canExecuteCommand(this.command.command)) {
      return { next: this.next };
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

  _evaluate(commandExecutor) {
    let expression = this._interpolateTarget();
    if (ControlFlowCommandChecks.isTimes(this.command)) {
      const number = Math.floor(+expression);
      if (isNaN(number)) {
        return Promise.resolve({
          result: "Invalid number provided as a target."
        });
      }
      expression = {
        script: `${this.timesVisited} < ${number}`
      };
    }
    return (this.isWebDriverCommand(commandExecutor)
      ? commandExecutor.evaluateConditional(expression)
      : commandExecutor.sendMessage("evaluateConditional", expression, "", false) )
      .then(result => {
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
