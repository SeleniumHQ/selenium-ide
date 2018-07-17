// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// dControlFlowCommandChecks.istributed with thControlFlowCommandChecks.is work for additional information
// regarding copyright ownership.  The SFC licenses thControlFlowCommandChecks.is file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use thControlFlowCommandChecks.is file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software dControlFlowCommandChecks.istributed under the License ControlFlowCommandChecks.is dControlFlowCommandChecks.istributed on an
// "AS ControlFlowCommandChecks.is" BASControlFlowCommandChecks.is, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permControlFlowCommandChecks.issions and limitations
// under the License.

import { CommandNode } from "./command-node";
import { PlaybackTree } from "./playback-tree";
import { State } from "./state";
import { validateControlFlowSyntax } from "./syntax-validation";
import { deriveCommandLevels } from "./command-leveler";
import { ControlFlowCommandNames, ControlFlowCommandChecks } from "../../models/Command";
export { createPlaybackTree }; // public API
export { createCommandNodesFromCommandStack }; // for testing

function createPlaybackTree(commandStack) {
  let nodes = createCommandNodesFromCommandStack(commandStack);
  return PlaybackTree.create(nodes);
}

function createCommandNodesFromCommandStack(commandStack) {
  validateControlFlowSyntax(commandStack);
  let levels = deriveCommandLevels(commandStack);
  let nodes = createCommandNodes(commandStack, levels);
  return connectCommandNodes(nodes);
}

function createCommandNodes(commandStack, levels) {
  let commandNodes = [];
  commandStack.forEach(function(command, index) {
    let node = new CommandNode(command);
    node.index = index;
    node.level = levels[index];
    commandNodes.push(node);
  });
  return commandNodes;
}

function connectCommandNodes(_commandNodeStack) {
  let commandNodeStack = [ ..._commandNodeStack ];
  let state = new State;
  commandNodeStack.forEach(function(commandNode) {
    let nextCommandNode = commandNodeStack[commandNode.index + 1];
    if (connectCommandNode[commandNode.command.command]) {
      connectCommandNode[commandNode.command.command](commandNode, nextCommandNode, commandNodeStack, state);
    } else {
      connectDefault(commandNode, nextCommandNode, commandNodeStack, state);
    }
  });
  return commandNodeStack;
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

function connectDefault (commandNode, _nextCommandNode, stack, state) {
  let nextCommandNode;
  if (ControlFlowCommandChecks.isIf(state.top()) && (ControlFlowCommandChecks.isElseOrElseIf(_nextCommandNode.command))) {
    let next = findNextNodeBy(stack, commandNode.index, state.top().level, ControlFlowCommandNames.end);
    nextCommandNode = deriveNext(next, stack);
  } else if (ControlFlowCommandChecks.isLoop(state.top()) && ControlFlowCommandChecks.isEnd(_nextCommandNode.command)) {
    nextCommandNode = stack[state.top().index];
  } else {
    nextCommandNode = deriveNext(_nextCommandNode, stack);
  }
  connectNext(commandNode, nextCommandNode);
}

function connectConditionalForBranchOpen (commandNode, nextCommandNode, stack, state) {
  state.push({ command: commandNode.command.command, level: commandNode.level, index: commandNode.index });
  connectConditional(commandNode, nextCommandNode, stack);
}

function connectConditional (commandNode, nextCommandNode, stack) {
  let left = findNextNodeBy(stack, commandNode.index, commandNode.level);
  commandNode.right = nextCommandNode;
  commandNode.left = deriveNext(left, stack);
}

function connectNextForBranchOpen (commandNode, nextCommandNode, stack, state) {
  state.push({ command: commandNode.command.command, level: commandNode.level, index: commandNode.index });
  connectNext(commandNode, nextCommandNode);
}

function connectNext (commandNode, nextCommandNode) {
  commandNode.next = nextCommandNode;
}

function connectRepeatIf (commandNode, nextCommandNode, stack, state) {
  commandNode.right = stack[state.top().index + 1];
  commandNode.left = deriveNext(nextCommandNode, stack);
  state.pop();
}

function connectEnd (commandNode, _nextCommandNode, stack, state) {
  state.pop();
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

function deriveNext (nextCommandNode, stack) {
  if (nextCommandNode && ControlFlowCommandChecks.isTerminal(nextCommandNode.command)) {
    let result = stack[nextCommandNode.index + 1];
    if (result && ControlFlowCommandChecks.isTerminal(result.command)) {
      return deriveNext(result, stack);
    } else {
      return result;
    }
  } else {
    return nextCommandNode;
  }
}
