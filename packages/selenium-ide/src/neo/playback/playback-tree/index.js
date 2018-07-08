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

import { CommandNode } from "./command-node";

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

const verify = {
  if: function (commandName, commandIndex, stack, state) {
    state.push({ command: commandName, index: commandIndex });
  },
  do: function (commandName, commandIndex, stack, state) {
    state.push({ command: commandName, index: commandIndex });
  },
  times: function (commandName, commandIndex, stack, state) {
    state.push({ command: commandName, index: commandIndex });
  },
  while: function (commandName, commandIndex, stack, state) {
    state.push({ command: commandName, index: commandIndex });
  },
  else: function (commandName, commandIndex, stack, state) {
    if (!isIf(topOf(state))) {
      throw "An else / elseIf used outside of an if block";
    }
  },
  elseIf: function (commandName, commandIndex, stack, state) {
    if (!isIf(topOf(state))) {
      throw "An else / elseIf used outside of an if block";
    }
  },
  repeatIf: function (commandName, commandIndex, stack, state) {
    if (!isDo(topOf(state))) {
      throw "A repeatIf used without a do block";
    }
    state.pop();
  },
  end: function (commandName, commandIndex, stack, state) {
    if (isLoop(topOf(state))) {
      state.pop();
    } else if (isIf(topOf(state))) {
      const numberOfElse = stack.slice(topOf(state).index, commandIndex).filter(command => isElse(command)).length;
      const allElseInCurrentSegment = stack.slice(topOf(state).index, commandIndex).filter(
        command => (command.command === Command.else || command.command === Command.elseIf));
      if (numberOfElse > 1) {
        throw "Too many else commands used";
      } else if (numberOfElse === 1 && !isElse(topOf(allElseInCurrentSegment))) {
        throw "Incorrect command order of elseIf / else";
      } else if (numberOfElse === 0 || isElse(topOf(allElseInCurrentSegment))) {
        state.pop();
      }
    } else {
      throw "Use of end without an opening keyword";
    }
  }
};

export function verifySyntax(commandStack) {
  let state = [];
  commandStack.forEach(function(command, commandIndex) {
    if (verify[command.command]) {
      verify[command.command](command.command, commandIndex, commandStack, state);
    }
  });
  if (!isEmpty(state)) {
    throw "Incomplete block at " + topOf(state).command;
  } else {
    return true;
  }
}

export class PlaybackTree {
  constructor(commandStack) {
    this._commandStack = commandStack;
    this._commandNodeStack = [];
  }

  _preprocessCommands() {
    return verifySyntax(this._commandStack);
    //let tracker = { state: [], level: 0 };
    //let that = this;
    //this._commandStack.forEach(function(currentCommand, currentCommandIndex) {
    //  that._preprocessCommand(currentCommand, currentCommandIndex, tracker);
    //});
    //return isStateEmpty(tracker.state);
  }

  _preprocessCommand(currentCommand, currentCommandIndex, tracker) {
    switch (currentCommand.command) {
      case Command.if:
      case Command.do:
      case Command.times:
      case Command.while:
        this._trackControlFlowBranchOpening(currentCommand, currentCommandIndex, tracker);
        break;
      case Command.else:
      case Command.elseIf:
        if (!isIf(topOf(tracker.state))) {
          throw "An else / elseIf used outside of an if block";
        }
        this._trackControlFlowCommandElse(currentCommand, tracker);
        break;
      case Command.repeatIf:
        if (!isDo(topOf(tracker.state))) {
          throw "A repeatIf used without a do block";
        }
        this._trackControlFlowBranchEnding(currentCommand, tracker);
        break;
      case Command.end:
        if (isLoop(topOf(tracker.state))) {
          this._trackControlFlowBranchEnding(currentCommand, tracker);
        } else if (isIf(topOf(tracker.state))) {
          const numberOfElse = this._numberOfElseInSegment(this._commandStack, topOf(tracker.state).index, currentCommandIndex);
          const allElseInCurrentSegment = this._allElseInSegment(this._commandStack, topOf(tracker.state).index, currentCommandIndex);
          if (numberOfElse > 1) {
            throw "Too many else commands used";
          } else if (numberOfElse === 1 && !isElse(topOf(allElseInCurrentSegment))) {
            throw "Incorrect command order of elseIf / else";
          } else if (numberOfElse === 0 || isElse(topOf(allElseInCurrentSegment))) {
            this._trackControlFlowBranchEnding(currentCommand, tracker);
          }
        } else {
          throw "Use of end without an opening keyword";
        }
        break;
      default:
        this._trackCommand(currentCommand, tracker);
        break;
    }
  }

  _numberOfElseInSegment(stack, startingIndex, endingIndex) {
    return stack.slice(startingIndex, endingIndex).filter(command => isElse(command)).length;
  }

  _allElseInSegment(stack, startingIndex, endingIndex) {
    return stack.slice(startingIndex, endingIndex).filter(command => (command.command === Command.else || command.command === Command.elseIf));
  }

  _trackControlFlowBranchOpening(currentCommand, currentCommandIndex, tracker) {
    tracker.state.push({ command: currentCommand.command, index: currentCommandIndex });
    this._createAndStoreCommandNode(currentCommand, tracker.level);
    tracker.level++;
  }

  _trackControlFlowCommandElse(currentCommand, tracker) {
    tracker.level--;
    this._createAndStoreCommandNode(currentCommand, tracker.level);
    tracker.level++;
  }

  _trackCommand(currentCommand, tracker) {
    this._createAndStoreCommandNode(currentCommand, tracker.level);
  }

  _trackControlFlowBranchEnding(currentCommand, tracker) {
    tracker.level--;
    this._createAndStoreCommandNode(currentCommand, tracker.level);
    tracker.state.pop();
  }

  _createAndStoreCommandNode(currentCommand, level) {
    let node = new CommandNode(currentCommand);
    node.level = level;
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
    let state = [];
    let that = this;
    that._commandNodeStack.forEach(function(currentCommandNode, currentCommandNodeIndex) {
      that._processCommandNode(currentCommandNode, currentCommandNodeIndex, state);
    });
  }


  _processCommandNode(commandNode, commandNodeIndex, state) {
    let nextCommandNode = this._commandNodeStack[commandNodeIndex + 1];
    if (nextCommandNode) {
      switch(commandNode.command.command) {
        case Command.if:
        case Command.while:
          state.push({ command: commandNode.command.command, level: commandNode.level, index: commandNodeIndex });
          commandNode.right = nextCommandNode;
          commandNode.left = this._findNextNodeAtLevel(commandNodeIndex, commandNode.level);
          break;
        case Command.do:
          state.push({ command: commandNode.command.command, level: commandNode.level, index: commandNodeIndex });
          commandNode.next = nextCommandNode;
          break;
        case Command.else:
          commandNode.next = nextCommandNode;
          break;
        case Command.elseIf:
          commandNode.right = nextCommandNode;
          commandNode.left = this._findNextNodeAtLevel(commandNodeIndex, commandNode.level);
          break;
        case Command.repeatIf:
          commandNode.right = this._commandNodeStack[topOf(state).index];
          commandNode.left = nextCommandNode;
          state.pop();
          break;
        case Command.end:
          state.pop();
          if (!isEmpty(state)) {
            if (isElse(nextCommandNode.command) || isElseIf(nextCommandNode.command)) {
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
