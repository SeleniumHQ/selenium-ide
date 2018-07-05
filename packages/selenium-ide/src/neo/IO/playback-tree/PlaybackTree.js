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

import { CommandStackHandler } from "./CommandStackHandler";

export class PlaybackTree {
  constructor(stack) {
    this.inputStack = stack;
    this._preprocessStack = [];
    this.stack = [];
  }

  preprocess() {
    let commandStackHandler = new CommandStackHandler(this.inputStack);
    commandStackHandler.preprocessCommands();
    this._preprocessStack = [...commandStackHandler.stack];
    return this._preprocessStack;
  }

  nextNodeAtSameLevel(stack, index, level) {
    for(let i = index + 1; i !== stack.length; i++) {
      if (stack[i].level === level) {
        return stack[i];
      }
    }
  }

  nextEndNode(stack, index, level) {
    for(let i = index + 1; i !== stack.length; i++) {
      if (stack[i].command.name === "end" && stack[i].level === level) {
        return stack[i];
      }
    }
  }

  previousOpeningNode(stack, index, level) {
    for(let i = index; i > -1; i--) {
      if (stack[i].level === level - 1) {
        return stack[i];
      }
    }
  }

  process() {
    this.stack = [...this._preprocessStack];
    let stack = this.stack;
    let nextNodeAtSameLevel = this.nextNodeAtSameLevel;
    let nextEndNode = this.nextEndNode;
    let previousOpeningNode = this.previousOpeningNode;
    stack.forEach(function(currentCommandNode, currentCommandIndex) {
      let nextCommandNode = stack[currentCommandIndex + 1];
      if (nextCommandNode) {
        if (currentCommandNode.command.isControlFlowCommand() &&
            !currentCommandNode.command.isEnd() &&
            !currentCommandNode.command.isDo()) {
          currentCommandNode.right = nextCommandNode;
          currentCommandNode.left = nextNodeAtSameLevel(stack, currentCommandIndex, currentCommandNode.level);
        } else if (nextCommandNode.command.isControlFlowCommand()) {
          let openingNode = previousOpeningNode(stack, currentCommandIndex, currentCommandNode.level);
          if (openingNode) {
            if (openingNode.command.isLoop()) {
              currentCommandNode.next = openingNode;
            } else if (openingNode.command.isDo() && currentCommandNode.command.isWhile()) {
              currentCommandNode.next = openingNode;
            } else if (!openingNode.command.isLoop() && !openingNode.command.isDo()) {
              currentCommandNode.next = nextEndNode(stack, currentCommandIndex, openingNode.level);
            } else {
              currentCommandNode.next = nextCommandNode;
            }
          }
        } else {
          currentCommandNode.next = nextCommandNode;
        }
      }
    });
    return this.stack;
  }

}

