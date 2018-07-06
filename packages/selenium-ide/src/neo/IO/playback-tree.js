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

function isElseIf(command) {
  return (command.name === "elseIf");
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
    if (!this._isStateEmpty()) {
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
      case "elseIf":
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

  _isStateEmpty() {
    return (this._state.length === 0);
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

  _findNextNodeAtLevel(index, level) {
    for(let i = index + 1; i < this._commandNodeStack.length + 1; i++) {
      if (this._commandNodeStack[i].level === level) {
        return this._commandNodeStack[i];
      }
    }
  }

  _findNextEndNodeAtLevel(index, level) {
    for(let i = index + 1; i < this._commandNodeStack.length + 1; i++) {
      if (this._commandNodeStack[i].level === level &&
          this._commandNodeStack[i].command.name === "end") {
        return this._commandNodeStack[i];
      }
    }
  }

  _processCommands() {
    this._state = [];
    let that = this;
    that._commandNodeStack.forEach(function(currentCommandNode, currentCommandNodeIndex) {
      that._processCommandNode(currentCommandNode, currentCommandNodeIndex);
    });
  }

  _processCommandNode(commandNode, commandNodeIndex) {
    let nextCommandNode = this._commandNodeStack[commandNodeIndex + 1];
    if (nextCommandNode) {
      switch(commandNode.command.name) {
        case "do":
          this._state.push({ name: commandNode.command.name, level: commandNode.level, index: commandNodeIndex });
          commandNode.next = nextCommandNode;
          break;
        case "if":
          this._state.push({ name: commandNode.command.name, level: commandNode.level, index: commandNodeIndex });
          commandNode.right = nextCommandNode;
          commandNode.left = this._findNextNodeAtLevel(commandNodeIndex, commandNode.level);
          break;
        case "else":
          commandNode.next = nextCommandNode;
          break;
        case "elseIf":
          commandNode.right = nextCommandNode;
          commandNode.left = this._findNextNodeAtLevel(commandNodeIndex, commandNode.level);
          break;
        case "while":
          if (isDo(this._topOfState())) {
            commandNode.right = this._commandNodeStack[this._topOfState().index];
            commandNode.left = this._findNextEndNodeAtLevel(commandNodeIndex, this._topOfState().level);
          } else {
            this._state.push({ name: commandNode.command.name, level: commandNode.level, index: commandNodeIndex });
            commandNode.right = nextCommandNode;
            commandNode.left = this._findNextEndNodeAtLevel(commandNodeIndex, commandNode.level);
          }
          break;
        case "end":
          this._state.pop();
          if (!this._isStateEmpty()) {
            if (isControlFlowCommand(nextCommandNode.command)) {
              commandNode.next = this._findNextEndNodeAtLevel(commandNodeIndex, this._topOfState().level);
            } else {
              commandNode.next = nextCommandNode;
            }
          }
          break;
        default:
          if (isIf(this._topOfState()) && (isElse(nextCommandNode.command) || isElseIf(nextCommandNode.command) || isEnd(nextCommandNode.command))) {
            commandNode.next = this._findNextEndNodeAtLevel(commandNodeIndex, this._topOfState().level);
          } else if (isWhile(this._topOfState()) && isControlFlowCommand(nextCommandNode.command)) {
            commandNode.next = this._commandNodeStack[this._topOfState().index];
          } else {
            commandNode.next = nextCommandNode;
          }
          break;
      }
    }
  }
}
