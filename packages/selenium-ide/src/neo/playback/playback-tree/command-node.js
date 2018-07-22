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

  execute(extCommand) {
    this.timesVisited++;
    this.checkRetryLimit();
    if (extCommand.isExtCommand(this.command.command)) {
      return extCommand[extCommand.name(this.command.command)](
        xlateArgument(this.command.target),
        xlateArgument(this.command.value))
        .then(() => {
          return {
            next: this.next
          };
        });
    } else if (this.isControlFlow()) {
      return this.evaluate(extCommand).then((result) => {
        return {
          next: result.next
        };
      });
    } else {
      return extCommand.sendMessage(
        this.command.command,
        this.command.target,
        this.command.value,
        extCommand.isWindowMethodCommand(this.command.command))
        .then((result) => {
          if (result.result === "success") {
            return {
              result: "success",
              next: this.next
            };
          } else {
            return result;
          }
        });
    }
  }

  evaluate(extCommand) {
    let expression = this.command.target;
    if (this.command.command === "times") {
      if (isNaN(this.command.target)) {
        throw Error("Number not provided in target input field of the times command.");
      }
      expression = `${this.timesVisited} <= ${this.command.target}`;
    }
    return extCommand.sendMessage(
      "evaluateConditional", expression, "", false)
      .then((result) => {
        if (result.value) {
          return {
            next: this.right
          };
        } else {
          return {
            next: this.left
          };
        }
      });
  }

  checkRetryLimit() {
    let limit = 1000;
    if (this.command.value && !isNaN(this.command.value)) {
      limit = this.command.value;
    }
    if (this.timesVisited > limit) {
      throw new Error(`Max command retry limit (${limit}) exceeded. Potential infinite loop detected. To override the limit, specify an alternate number in the value input field of the looping command.`);
    }
  }
}
