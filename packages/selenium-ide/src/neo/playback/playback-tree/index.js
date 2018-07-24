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
  if (ControlFlowCommandChecks.isTerminal(commandNodeStack[0].command)) {
    commandNodeStack.shift();
  }
  return commandNodeStack;
}

let connectCommandNode = {
  [ControlFlowCommandNames.do]: trackBranchOpen,
  [ControlFlowCommandNames.elseIf]: connectConditional,
  [ControlFlowCommandNames.end]: trackBranchClose,
  [ControlFlowCommandNames.if]: connectConditionalForBranchOpen,
  [ControlFlowCommandNames.repeatIf]: connectDo,
  [ControlFlowCommandNames.times]: connectConditionalForBranchOpen,
  [ControlFlowCommandNames.while]: connectConditionalForBranchOpen
};

function connectDefault (commandNode, _nextCommandNode, stack, state) {
  let nextCommandNode;
  if (ControlFlowCommandChecks.isIf(state.top()) && ControlFlowCommandChecks.isElseOrElseIf(_nextCommandNode.command)) {
    let next = findNextNodeBy(stack, commandNode.index, state.top().level, ControlFlowCommandNames.end);
    nextCommandNode = deriveNext(next, stack);
  } else if (ControlFlowCommandChecks.isLoop(state.top()) && ControlFlowCommandChecks.isEnd(_nextCommandNode.command)) {
    nextCommandNode = stack[state.top().index];
  } else if (ControlFlowCommandChecks.isElse(commandNode.command)) {
    nextCommandNode = undefined;
  } else {
    nextCommandNode = deriveNext(_nextCommandNode, stack);
  }
  connectNext(commandNode, nextCommandNode);
}

function trackBranchOpen (commandNode, nextCommandNode, stack, state) {
  state.push({ command: commandNode.command.command, level: commandNode.level, index: commandNode.index });
}

function trackBranchClose (commandNode, nextCommandNode, stack, state) {
  state.pop();
}

function connectConditionalForBranchOpen (commandNode, nextCommandNode, stack, state) {
  trackBranchOpen(commandNode, nextCommandNode, stack, state);
  connectConditional(commandNode, nextCommandNode, stack);
}

function connectConditional (commandNode, nextCommandNode, stack) {
  let left = findNextNodeBy(stack, commandNode.index, commandNode.level);
  let right = ControlFlowCommandChecks.isEnd(nextCommandNode.command) ? undefined : nextCommandNode;
  commandNode.right = right;
  commandNode.left = deriveNext(left, stack);
}

function connectNext (commandNode, nextCommandNode) {
  commandNode.next = nextCommandNode;
}

function connectDo (commandNode, nextCommandNode, stack, state) {
  commandNode.right = stack[state.top().index + 1];
  commandNode.left = deriveNext(nextCommandNode, stack);
  trackBranchClose(commandNode, nextCommandNode, stack, state);
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

function deriveNext (targetNode, stack) {
  if (targetNode && ControlFlowCommandChecks.isTerminal(targetNode.command)) {
    let result = stack[targetNode.index + 1];
    if (result && ControlFlowCommandChecks.isTerminal(result.command)) {
      return deriveNext(result, stack);
    } else {
      return result;
    }
  } else {
    return targetNode;
  }
}
