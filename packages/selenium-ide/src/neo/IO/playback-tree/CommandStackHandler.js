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

function isIf(command) {
  return (command.name === "if");
}

function isElse(command) {
  return (command.name === "else");
}

function isDo(command) {
  return (command.name === "do");
}

function isLoop(command) {
  return (command.name === "while" ||
          command.name === "times" ||
          command.name === "do");
}

export class CommandStackHandler {
  constructor(stack) {
    this._inputStack = stack;
    this._state = [];
    this._level = 0;
    this._currentCommand;
    this._currentCommandIndex;
    this.stack = [];
  }

  preprocessCommands() {
    let that = this;
    this._inputStack.forEach(function(currentCommand, currentCommandIndex) {
      that._currentCommand = currentCommand;
      that._currentCommandIndex = currentCommandIndex;
      that._preprocessCommand();
    });
    this.confirmControlFlowSyntax();
  }

  _preprocessCommand() {
    switch (this._currentCommand.name) {
      case "if":
      case "do":
      case "times":
        this._trackControlFlowBranchOpening();
        break;
      case "while":
        if (isDo(this._topOfState())) {
          this._trackCommand();
        } else {
          this._trackControlFlowBranchOpening();
        }
        break;
      case "repeatIf":
        if (!isDo(this._topOfState())) {
          throw "A repeatIf used without a do block";
        }
        this._trackCommand();
        break;
      case "else":
        if (!isIf(this._topOfState())) {
          throw "An else / elseIf used outside of an if block";
        }
        this._trackControlFlowCommandElse();
        break;
      case "end":
        if (isLoop(this._topOfState())) {
          this._trackControlFlowBranchEnding();
        } else if (isIf(this._topOfState())) {
          const elseCount = this._currentSegment().filter(command => command.name === "else").length;
          const elseSegment = this._currentSegment().filter(command => command.name.match(/else/));
          if (elseCount > 1) {
            throw "Too many else commands used";
          } else if (elseCount === 1 && !isElse(this._topOf(elseSegment))) {
            throw "Incorrect command order of elseIf / else";
          } else if (elseCount === 0 || isElse(this._topOf(elseSegment))) {
            this._trackControlFlowBranchEnding();
          }
        } else {
          throw "Use of end without an opening keyword";
        }
        break;
      default:
        this._trackCommand();
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

  _trackControlFlowBranchOpening() {
    this._state.push({ name: this._currentCommand.name, index: this._currentCommandIndex });
    this._createAndStoreCommandNode();
    this._level++;
  }

  _trackControlFlowCommandElse() {
    this._level--;
    this._createAndStoreCommandNode();
    this._level++;
  }

  _trackCommand() {
    this._createAndStoreCommandNode();
  }

  _trackControlFlowBranchEnding() {
    this._level--;
    this._createAndStoreCommandNode();
    this._state.pop();
  }

}
