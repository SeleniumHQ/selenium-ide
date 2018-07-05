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

import { CommandNode } from "./CommandNode";

export class CommandStackHandler {
  constructor(stack) {
    this._inputStack = stack;
    this._state = [];
    this._level = 0;
    this._currentCommand;
    this._currentCommandIndex;
    this.stack = [];
  }

  preprocessCommand(command, index) {
    this._currentCommand = command;
    this._currentCommandIndex = index;
    switch (command.name) {
      case "if":
      case "do":
      case "times":
        this._mutation1();
        break;
      case "while":
        if (this._topOfState().name === "do") {
          this._mutation3();
        } else {
          this._mutation1();
        }
        break;
      case "repeatIf":
        if (this._topOfState().name !== "do") {
          throw "A repeatIf used without a do block";
        }
        this._mutation3();
        break;
      case "else":
        if (this._topOfState().name !== "if") {
          throw "An else / elseIf used outside of an if block";
        }
        this._mutation2();
        break;
      case "end":
        if (this._terminatesLoop()) {
          this._mutation4();
        } else if (this._terminatesIf()) {
          const elseCount = this._currentSegment().filter(command => command.name === "else").length;
          const elseSegment = this._currentSegment().filter(command => command.name.match(/else/));
          if (elseCount > 1) {
            throw "Too many else commands used";
          } else if (elseCount === 1 && this._topOf(elseSegment).name !== "else") {
            throw "Incorrect command order of elseIf / else";
          } else if (elseCount === 0 || this._topOf(elseSegment).name === "else") {
            this._mutation4();
          }
        } else {
          throw "Use of end without an opening keyword";
        }
        break;
      default:
        this._mutation3();
        break;
    }
  }

  confirmControlFlowSyntax() {
    if (this._state.length > 0) {
      throw "Incomplete block at " + this._topOfState().name;
    }
  }

  _createAndStoreCommandNode() {
    let node = new CommandNode;
    node.command = this._currentCommand;
    node.level = this._level;
    this.stack.push(node);
  }

  _topOf(segment) {
    return segment[segment.length - 1];
  }

  _topOfState() {
    let command = this._state[this._state.length - 1];
    if (command) {
      return this._topOf(this._state);
    } else {
      return { name: "" };
    }
  }

  _currentSegment() {
    return this._inputStack.slice(this._topOfState().index, this._currentCommandIndex);
  }

  _terminatesIf() {
    return (this._topOfState().name === "if");
  }

  _terminatesLoop() {
    return (this._topOfState().name === "while" ||
            this._topOfState().name === "times" ||
            this._topOfState().name === "do");
  }

  _mutation1() {
    this._createAndStoreCommandNode();
    this._state.push({ name: this._currentCommand.name, index: this._currentCommandIndex });
    this._level++;
  }

  _mutation2() {
    this._level--;
    this._createAndStoreCommandNode();
    this._level++;
  }

  _mutation3() {
    this._createAndStoreCommandNode();
  }

  _mutation4() {
    this._level--;
    this._createAndStoreCommandNode();
    this._state.pop();
  }

}
