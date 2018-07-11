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
import { PlaybackTree } from "./playback-tree";
import { ControlFlowCommandNames } from "../../models/Command";
export { createPlaybackTree }; // public API
export { createCommandNodesFromCommandStack, verifyControlFlowSyntax, deriveCommandLevels }; // for testing

function createPlaybackTree(commandStack) {
  let nodes = createCommandNodesFromCommandStack(commandStack);
  return PlaybackTree.create(nodes);
}

function createCommandNodesFromCommandStack(commandStack) {
  verifyControlFlowSyntax(commandStack);
  let levels = deriveCommandLevels(commandStack);
  let initNodes = initCommandNodes(commandStack, levels);
  return connectCommandNodes(initNodes);
}

function commandNamesEqual(command, target) {
  return (command.command === target);
}

function isDo(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.do);
}

function isElse(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.else);
}

function isElseOrElseIf(command) {
  return (commandNamesEqual(command, ControlFlowCommandNames.else) ||
          commandNamesEqual(command, ControlFlowCommandNames.elseIf));
}

function isEnd(command) {
  return (commandNamesEqual(command, ControlFlowCommandNames.end));
}

function isIf(command) {
  return (commandNamesEqual(command, ControlFlowCommandNames.if));
}

function isLoop(command) {
  return (commandNamesEqual(command, ControlFlowCommandNames.while) ||
          commandNamesEqual(command, ControlFlowCommandNames.times));
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

function verifyControlFlowSyntax(commandStack) {
  let state = [];
  commandStack.forEach(function(command, commandIndex) {
    if (verifyCommand[command.command]) {
      verifyCommand[command.command](command.command, commandIndex, commandStack, state);
    }
  });
  if (!isEmpty(state)) {
    throw new SyntaxError("Incomplete block at " + topOf(state).command);
  } else {
    return true;
  }
}

const verifyCommand = {
  [ControlFlowCommandNames.do]: trackControlFlowBranchOpen,
  [ControlFlowCommandNames.else]: verifyElse,
  [ControlFlowCommandNames.elseIf]: verifyElse,
  [ControlFlowCommandNames.end]: verifyEnd,
  [ControlFlowCommandNames.if]: trackControlFlowBranchOpen,
  [ControlFlowCommandNames.repeatIf]: verifyRepeatIf,
  [ControlFlowCommandNames.times]: trackControlFlowBranchOpen,
  [ControlFlowCommandNames.while]: trackControlFlowBranchOpen
};

function trackControlFlowBranchOpen (commandName, commandIndex, stack, state) {
  state.push({ command: commandName, index: commandIndex });
}

function verifyElse (commandName, commandIndex, stack, state) {
  if (!isIf(topOf(state))) {
    throw new SyntaxError("An else / else if used outside of an if block");
  }
}

function verifyEnd (commandName, commandIndex, stack, state) {
  if (isLoop(topOf(state))) {
    state.pop();
  } else if (isIf(topOf(state))) {
    const numberOfElse = stack.slice(topOf(state).index, commandIndex).filter(command => isElse(command)).length;
    const allElses = stack.slice(topOf(state).index, commandIndex).filter(
      command => (command.command === ControlFlowCommandNames.else || command.command === ControlFlowCommandNames.elseIf));
    if (numberOfElse > 1) {
      throw new SyntaxError("Too many else commands used");
    } else if (numberOfElse === 1 && !isElse(topOf(allElses))) {
      throw new SyntaxError("Incorrect command order of else if / else");
    } else if (numberOfElse === 0 || isElse(topOf(allElses))) {
      state.pop();
    }
  } else {
    throw new SyntaxError("Use of end without an opening keyword");
  }
}

function verifyRepeatIf (commandName, commandIndex, stack, state) {
  if (!isDo(topOf(state))) {
    throw new SyntaxError("A repeat if used without a do block");
  }
  state.pop();
}

function deriveCommandLevels(commandStack) {
  let level = 0;
  let levels = [];
  commandStack.forEach(function(command) {
    if (levelCommand[command.command]) {
      let result = levelCommand[command.command](command, level, levels);
      level = result.level;
      levels = result.levels;
    } else {
      let result = levelDefault(command, level, levels);
      levels = result.levels;
    }
  });
  return levels;
}

let levelCommand = {
  [ControlFlowCommandNames.do]: levelBranchOpen,
  [ControlFlowCommandNames.else]: levelElse,
  [ControlFlowCommandNames.elseIf]: levelElse,
  [ControlFlowCommandNames.end]: levelBranchEnd,
  [ControlFlowCommandNames.if]: levelBranchOpen,
  [ControlFlowCommandNames.repeatIf]: levelBranchEnd,
  [ControlFlowCommandNames.times]: levelBranchOpen,
  [ControlFlowCommandNames.while]: levelBranchOpen
};

function levelDefault (command, level, _levels) {
  let levels = [ ..._levels ];
  levels.push(level);
  return { level, levels };
}

function levelBranchOpen (command, level, _levels) {
  let levels = [ ..._levels ];
  levels.push(level);
  level++;
  return { level, levels };
}

function levelBranchEnd (command, level, _levels) {
  let levels = [ ..._levels ];
  level--;
  levels.push(level);
  return { level, levels };
}

function levelElse (command, level, _levels) {
  let levels = [ ..._levels ];
  level--;
  levels.push(level);
  level++;
  return { level, levels };
}

function initCommandNodes(commandStack, levels) {
  let commandNodes = [];
  commandStack.forEach(function(command, index) {
    let node = new CommandNode(command);
    node.index = index;
    node.level = levels[index];
    commandNodes.push(node);
  });
  return commandNodes;
}

function connectCommandNodes(commandNodeStack) {
  let _commandNodeStack = [ ...commandNodeStack ];
  let state = [];
  _commandNodeStack.forEach(function(commandNode) {
    let nextCommandNode = _commandNodeStack[commandNode.index + 1];
    if (nextCommandNode) {
      if (connectCommandNode[commandNode.command.command]) {
        connectCommandNode[commandNode.command.command](commandNode, nextCommandNode, _commandNodeStack, state);
      } else {
        connectDefault(commandNode, nextCommandNode, _commandNodeStack, state);
      }
    }
  });
  return _commandNodeStack;
}

let connectCommandNode = {
  [ControlFlowCommandNames.do]: connectNextForBranchOpen,
  [ControlFlowCommandNames.else]: connectNext,
  [ControlFlowCommandNames.elseIf]: connectConditional,
  [ControlFlowCommandNames.end]: connectEnd,
  [ControlFlowCommandNames.if]: connectConditionalForBranchOpen,
  [ControlFlowCommandNames.repeatIf]: connectRepeatIf,
  [ControlFlowCommandNames.times]: connectConditionalForBranchOpen,
  [ControlFlowCommandNames.while]: connectConditionalForBranchOpen
};

function connectDefault (commandNode, nextCommandNode, stack, state) {
  let _nextCommandNode;
  if (isIf(topOf(state)) && (isElseOrElseIf(nextCommandNode.command))) {
    _nextCommandNode = findNextNodeBy(stack, commandNode.index, topOf(state).level, ControlFlowCommandNames.end);
  } else if (isLoop(topOf(state)) && isEnd(nextCommandNode.command)) {
    _nextCommandNode = stack[topOf(state).index];
  } else {
    _nextCommandNode = nextCommandNode;
  }
  connectNext(commandNode, _nextCommandNode);
}

function connectConditionalForBranchOpen (commandNode, nextCommandNode, stack, state) {
  state.push({ command: commandNode.command.command, level: commandNode.level, index: commandNode.index });
  connectConditional(commandNode, nextCommandNode, stack);
}

function connectConditional (commandNode, nextCommandNode, stack) {
  commandNode.right = nextCommandNode;
  commandNode.left = findNextNodeBy(stack, commandNode.index, commandNode.level);
}

function connectNextForBranchOpen (commandNode, nextCommandNode, stack, state) {
  state.push({ command: commandNode.command.command, level: commandNode.level, index: commandNode.index });
  connectNext(commandNode, nextCommandNode);
}

function connectNext (commandNode, nextCommandNode) {
  commandNode.next = nextCommandNode;
}

function connectRepeatIf (commandNode, nextCommandNode, stack, state) {
  commandNode.right = stack[topOf(state).index];
  commandNode.left = nextCommandNode;
  state.pop();
}

function connectEnd (commandNode, nextCommandNode, stack, state) {
  state.pop();
  if (!isEmpty(state)) {
    let _nextCommandNode;
    if (isElseOrElseIf(nextCommandNode.command)) {
      _nextCommandNode = findNextNodeBy(stack, commandNode.index, topOf(state).level, ControlFlowCommandNames.end);
    } else {
      _nextCommandNode = nextCommandNode;
    }
    connectNext(commandNode, _nextCommandNode);
  }
}

function findNextNodeBy(stack, index, level, commandName) {
  for(let i = index + 1; i < stack.length + 1; i++) {
    if (commandName) {
      if (stack[i].level === level &&
          stack[i].command.command === commandName) {
        return stack[i];
      }
    } else {
      if (stack[i].level === level) {
        return stack[i];
      }
    }
  }
}
