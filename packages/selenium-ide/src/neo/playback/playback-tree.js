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
  constructor(command) {
    this.command = command;
    this.next = undefined;
    this.left = undefined;
    this.right = undefined;
    this.level;
    this.timesVisited = 0;
  }
}

const Command = {
  if: "if",
  else: "else",
  elseIf: "elseIf",
  times: "times",
  while: "while",
  do: "do",
  repeatIf: "repeatIf",
  end: "end"
};

function isControlFlowCommand(command) {
  // #command is the command name
  return (command.command === Command.do ||
          command.command === Command.else ||
          command.command === Command.elseIf ||
          command.command === Command.end ||
          command.command === Command.if ||
          command.command === Command.repeatIf ||
          command.command === Command.times ||
          command.command === Command.while);
}

function isDo(command) {
  return (command.command === Command.do);
}

function isElse(command) {
  return (command.command === Command.else);
}

function isElseIf(command) {
  return (command.command === Command.elseIf);
}

function isEnd(command) {
  return (command.command === Command.end);
}

function isIf(command) {
  return (command.command === Command.if);
}

function isLoop(command) {
  return (command.command === Command.while ||
          command.command === Command.times ||
          command.command === Command.do);
}

function isWhile(command) {
  return (command.command === Command.while);
}

function isEmpty(obj) {
  if (obj) {
    return (obj.length === 0);
  } else {
    return false;
  }
}

function topOf(array) {
  let arr = array[array.length - 1];
  if (arr) {
    return arr;
  } else {
    return { };
  }
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
    if (!isEmpty(this._state)) {
      throw "Incomplete block at " + topOf(this._state).command;
    }
    return true;
  }

  _preprocessCommand() {
    switch (this._currentCommand.command) {
      case Command.if:
      case Command.do:
      case Command.times:
        this._trackControlFlowBranchOpening();
        break;
      case Command.while:
        if (isDo(topOf(this._state))) {
          this._trackCommand();
        } else {
          this._trackControlFlowBranchOpening();
        }
        break;
      case Command.repeatIf:
        if (!isDo(topOf(this._state))) {
          throw "A repeatIf used without a do block";
        }
        this._trackCommand();
        break;
      case Command.else:
      case Command.elseIf:
        if (!isIf(topOf(this._state))) {
          throw "An else / elseIf used outside of an if block";
        }
        this._trackControlFlowCommandElse();
        break;
      case Command.end:
        if (isLoop(topOf(this._state))) {
          this._trackControlFlowBranchEnding();
        } else if (isIf(topOf(this._state))) {
          const numberOfElse = this._currentSegment().filter(command => isElse(command)).length;
          const allElseInCurrentSegment = this._currentSegment().filter(
            command => (command.command === Command.else || command.command === Command.elseIf));
          if (numberOfElse > 1) {
            throw "Too many else commands used";
          } else if (numberOfElse === 1 && !isElse(topOf(allElseInCurrentSegment))) {
            throw "Incorrect command order of elseIf / else";
          } else if (numberOfElse === 0 || isElse(topOf(allElseInCurrentSegment))) {
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

  _currentSegment() {
    return this._commandStack.slice(topOf(this._state).index, this._currentCommandIndex);
  }

  _trackControlFlowBranchOpening() {
    this._state.push({ command: this._currentCommand.command, index: this._currentCommandIndex });
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

  _createAndStoreCommandNode() {
    let node = new CommandNode(this._currentCommand);
    node.level = this._level;
    this._commandNodeStack.push(node);
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
          this._commandNodeStack[i].command.command === Command.end) {
        return this._commandNodeStack[i];
      }
    }
  }

  _processCommandNodes() {
    let that = this;
    that._commandNodeStack.forEach(function(currentCommandNode, currentCommandNodeIndex) {
      that._processCommandNode(currentCommandNode, currentCommandNodeIndex);
    });
  }


  _processCommandNode(commandNode, commandNodeIndex) {
    let state = this._state;
    let nextCommandNode = this._commandNodeStack[commandNodeIndex + 1];
    if (nextCommandNode) {
      switch(commandNode.command.command) {
        case Command.do:
          state.push({ command: commandNode.command.command, level: commandNode.level, index: commandNodeIndex });
          commandNode.next = nextCommandNode;
          break;
        case Command.if:
          state.push({ command: commandNode.command.command, level: commandNode.level, index: commandNodeIndex });
          commandNode.right = nextCommandNode;
          commandNode.left = this._findNextNodeAtLevel(commandNodeIndex, commandNode.level);
          break;
        case Command.else:
          commandNode.next = nextCommandNode;
          break;
        case Command.elseIf:
          commandNode.right = nextCommandNode;
          commandNode.left = this._findNextNodeAtLevel(commandNodeIndex, commandNode.level);
          break;
        case Command.while:
          if (isDo(topOf(state))) {
            commandNode.right = this._commandNodeStack[topOf(state).index];
            commandNode.left = this._findNextEndNodeAtLevel(commandNodeIndex, topOf(state).level);
          } else {
            state.push({ command: commandNode.command.command, level: commandNode.level, index: commandNodeIndex });
            commandNode.right = nextCommandNode;
            commandNode.left = this._findNextEndNodeAtLevel(commandNodeIndex, commandNode.level);
          }
          break;
        case Command.end:
          state.pop();
          if (!isEmpty(state)) {
            if (isControlFlowCommand(nextCommandNode.command)) {
              commandNode.next = this._findNextEndNodeAtLevel(commandNodeIndex, topOf(state).level);
            } else {
              commandNode.next = nextCommandNode;
            }
          }
          break;
        default:
          if (isIf(topOf(state)) && (isElse(nextCommandNode.command) || isElseIf(nextCommandNode.command) || isEnd(nextCommandNode.command))) {
            commandNode.next = this._findNextEndNodeAtLevel(commandNodeIndex, topOf(state).level);
          } else if (topOf(state) && isWhile(topOf(state)) && isControlFlowCommand(nextCommandNode.command)) {
            commandNode.next = this._commandNodeStack[topOf(state).index];
          } else {
            commandNode.next = nextCommandNode;
          }
          break;
      }
    }
  }
}
