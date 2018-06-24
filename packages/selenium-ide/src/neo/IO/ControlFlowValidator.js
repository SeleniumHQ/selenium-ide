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

export default class ControlFlowValidator {
  constructor(commandStack) {
    this.commandStack = commandStack;
  }

  process() {
    if ((this.startsWithWhile()) && (this.endsWithEndWhile())) {
      if (this.containsIf() && this.ifIsNotClosed()) {
        return false;
      } else if (this.hasIncompleteCommandSegments("if", "end")) {
        return false;
      } else {
        return true;
      }
    } else if (this.startsWithIf() && this.endsWithEnd()) {
      if (this.containsWhile() && this.whileIsNotClosed()) {
        return false;
      } else if (this.hasIncompleteCommandSegments("if", "end")) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  commandCount(commandName) {
    return this.commandStack.filter(command => command === commandName).length;
  }

  hasIncompleteCommandSegments(openingKeyword, closingKeyword) {
    return (this.commandCount(openingKeyword) !== this.commandCount(closingKeyword));
  }

  startsWithIf() {
    return this.commandStack[0] === "if";
  }

  startsWithWhile() {
    return this.commandStack[0] === "while";
  }

  containsIf() {
    return this.commandStack.includes("if");
  }

  containsWhile() {
    return this.commandStack.includes("while");
  }

  endsWithEnd() {
    return this.commandStack[this.commandStack.length - 1] === "end";
  }

  endsWithEndWhile() {
    return this.commandStack[this.commandStack.length - 1] === "endWhile";
  }

  whileIsNotClosed() {
    return !this.commandStack.includes("endWhile");
  }

  ifIsNotClosed() {
    return !this.commandStack.includes("end");
  }
}
