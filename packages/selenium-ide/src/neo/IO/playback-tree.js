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

class CommandNode {
  constructor() {
    this.command;
    this.next = undefined;
    this.left = undefined;
    this.right = undefined;
    this.level;
    this.timesVisited;
  }
}

function isControlFlowCommand(command) {
  return (command.name === "do" ||
          command.name === "else" ||
          command.name === "elseIf" ||
          command.name === "end" ||
          command.name === "if" ||
          command.name === "repeatIf" ||
          command.name === "times" ||
          command.name === "while");
}

function isDo(command) {
  return (command.name === "do");
}

function isElse(command) {
  return (command.name === "else");
}

function isEnd(command) {
  return (command.name === "end");
}

function isIf(command) {
  return (command.name === "if");
}

function isLoop(command) {
  return (command.name === "while" ||
          command.name === "times" ||
          command.name === "do");
}

function isWhile(command) {
  return (command.name === "while");
}

export class PlaybackTree {
  constructor(commandStack) {
    this._commandStack = commandStack;
    this._state = [];
    this._level = 0;
    this._currentCommand;
    this._currentCommandIndex;
    this._commandNodeStack = [];
  }

  _preprocessCommands() {
    let that = this;
    this._commandStack.forEach(function(currentCommand, currentCommandIndex) {
      that._currentCommand = currentCommand;
      that._currentCommandIndex = currentCommandIndex;
      that._preprocessCommand();
    });
    if (this._state.length > 0) {
      throw "Incomplete block at " + this._topOfState().name;
    }
    return true;
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
          const numberOfElse = this._currentSegment().filter(command => isElse(command)).length;
          const allElseInCurrentSegment = this._currentSegment().filter(command => command.name.match(/else/));
          if (numberOfElse > 1) {
            throw "Too many else commands used";
          } else if (numberOfElse === 1 && !isElse(this._topOf(allElseInCurrentSegment))) {
            throw "Incorrect command order of elseIf / else";
          } else if (numberOfElse === 0 || isElse(this._topOf(allElseInCurrentSegment))) {
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

  _createAndStoreCommandNode() {
    let node = new CommandNode;
    node.command = this._currentCommand;
    node.level = this._level;
    this._commandNodeStack.push(node);
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
    return this._commandStack.slice(this._topOfState().index, this._currentCommandIndex);
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

  _nextNodeAtSameLevel(stack, index, level) {
    for(let i = index + 1; i !== stack.length; i++) {
      if (stack[i].level === level) {
        return stack[i];
      }
    }
  }

  _nextEndNode(stack, index, level) {
    for(let i = index + 1; i !== stack.length; i++) {
      if (stack[i].command.name === "end" && stack[i].level === level) {
        return stack[i];
      }
    }
  }

  _previousOpeningNode(stack, index, level) {
    for(let i = index; i > -1; i--) {
      if (stack[i].level === level - 1) {
        return stack[i];
      }
    }
  }

  _process() {
    let that = this;
    that._commandNodeStack.forEach(function(currentCommandNode, currentCommandIndex) {
      let nextCommandNode = that._commandNodeStack[currentCommandIndex + 1];
      if (nextCommandNode) {
        if (isControlFlowCommand(currentCommandNode.command) &&
            !isEnd(currentCommandNode.command) &&
            !isDo(currentCommandNode.command)) {
          currentCommandNode.right = nextCommandNode;
          currentCommandNode.left = that._nextNodeAtSameLevel(that._commandNodeStack, currentCommandIndex, currentCommandNode.level);
        } else if (isControlFlowCommand(nextCommandNode.command)) {
          let openingNode = that._previousOpeningNode(that._commandNodeStack, currentCommandIndex, currentCommandNode.level);
          if (openingNode) {
            if (isLoop(openingNode.command)) {
              currentCommandNode.next = openingNode;
            } else if (isDo(openingNode.command) && isWhile(currentCommandNode.command)) {
              currentCommandNode.next = openingNode;
            } else if (!isLoop(openingNode.command) && !isDo(openingNode.command)) {
              currentCommandNode.next = that._nextEndNode(that._commandNodeStack, currentCommandIndex, openingNode.level);
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
