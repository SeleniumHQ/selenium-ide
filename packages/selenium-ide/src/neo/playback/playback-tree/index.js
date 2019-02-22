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

import { CommandNode } from './command-node'
import { State } from './state'
import { validateControlFlowSyntax, repeatIfError } from './syntax-validation'
import { deriveCommandLevels } from './command-leveler'
import {
  ControlFlowCommandNames,
  ControlFlowCommandChecks,
} from '../../models/Command'
export { createPlaybackTree } // public API
export { createCommandNodesFromCommandStack } // for testing

function createPlaybackTree(commandStack, isValidationDisabled) {
  let nodes = createCommandNodesFromCommandStack(
    commandStack,
    isValidationDisabled
  )
  return {
    startingCommandNode: nodes[0],
    containsControlFlow: containsControlFlow(nodes),
  }
}

function containsControlFlow(nodes) {
  return !!nodes.filter(node => node.isControlFlow()).length
}

function createCommandNodesFromCommandStack(
  commandStack,
  isValidationDisabled = false
) {
  if (!isValidationDisabled) validateControlFlowSyntax(commandStack)
  let levels = deriveCommandLevels(commandStack)
  let nodes = createCommandNodes(commandStack, levels)
  return connectCommandNodes(nodes)
}

function createCommandNodes(commandStack, levels) {
  let commandNodes = []
  commandStack.forEach(function(command, index) {
    let node = new CommandNode(command)
    node.index = index
    node.level = levels[index]
    commandNodes.push(node)
  })
  return commandNodes
}

function connectCommandNodes(_commandNodeStack) {
  let commandNodeStack = [..._commandNodeStack]
  let state = new State()
  commandNodeStack.forEach(function(commandNode) {
    let nextCommandNode = commandNodeStack[commandNode.index + 1]
    if (connectCommandNode[commandNode.command.command]) {
      connectCommandNode[commandNode.command.command](
        commandNode,
        nextCommandNode,
        commandNodeStack,
        state
      )
    } else {
      connectDefault(commandNode, nextCommandNode, commandNodeStack, state)
    }
  })
  return commandNodeStack
}

let connectCommandNode = {
  [ControlFlowCommandNames.do]: trackBranchOpen,
  [ControlFlowCommandNames.else]: connectNext,
  [ControlFlowCommandNames.elseIf]: connectConditional,
  [ControlFlowCommandNames.end]: trackBranchClose,
  [ControlFlowCommandNames.forEach]: connectConditionalForBranchOpen,
  [ControlFlowCommandNames.if]: connectConditionalForBranchOpen,
  [ControlFlowCommandNames.repeatIf]: connectDo,
  [ControlFlowCommandNames.times]: connectConditionalForBranchOpen,
  [ControlFlowCommandNames.while]: connectConditionalForBranchOpen,
}

function connectDefault(commandNode, _nextCommandNode, stack, state) {
  let nextCommandNode
  if (
    ControlFlowCommandChecks.isIf(state.top()) &&
    ControlFlowCommandChecks.isElseOrElseIf(_nextCommandNode.command)
  ) {
    nextCommandNode = findNextNodeBy(
      stack,
      commandNode.index,
      state.top().level,
      ControlFlowCommandNames.end
    )
  } else if (
    ControlFlowCommandChecks.isLoop(state.top()) &&
    ControlFlowCommandChecks.isEnd(_nextCommandNode.command)
  ) {
    nextCommandNode = stack[state.top().index]
  } else {
    nextCommandNode = _nextCommandNode
  }
  connectNext(commandNode, nextCommandNode)
}

function trackBranchOpen(commandNode, nextCommandNode, stack, state) {
  state.push({
    command: commandNode.command.command,
    level: commandNode.level,
    index: commandNode.index,
  })
  if (ControlFlowCommandChecks.isDo(commandNode.command))
    connectNext(commandNode, nextCommandNode, stack, state)
}

function trackBranchClose(commandNode, nextCommandNode, stack, state) {
  state.pop()
  const top = state.top()
  let nextCommandNodeOverride
  if (
    top &&
    ControlFlowCommandChecks.isLoop(top) &&
    nextCommandNode &&
    ControlFlowCommandChecks.isEnd(nextCommandNode.command)
  )
    nextCommandNodeOverride = stack[top.index]
  connectNext(
    commandNode,
    nextCommandNodeOverride ? nextCommandNodeOverride : nextCommandNode,
    stack,
    state
  )
}

function connectConditionalForBranchOpen(
  commandNode,
  nextCommandNode,
  stack,
  state
) {
  trackBranchOpen(commandNode, nextCommandNode, stack, state)
  connectConditional(commandNode, nextCommandNode, stack)
}

function connectConditional(commandNode, nextCommandNode, stack) {
  let left = findNextNodeBy(stack, commandNode.index, commandNode.level)
  let right = nextCommandNode
  commandNode.right = right
  commandNode.left = left
}

function connectNext(commandNode, nextCommandNode) {
  commandNode.next = nextCommandNode
}

function connectDo(commandNode, nextCommandNode, stack, state) {
  const top = state.top()
  if (!top) repeatIfError()
  commandNode.right = stack[top.index]
  commandNode.left = nextCommandNode
  state.pop()
}

function findNextNodeBy(stack, index, level, commandName) {
  for (let i = index + 1; i < stack.length + 1; i++) {
    if (commandName) {
      if (
        stack[i].level === level &&
        stack[i].command.command === commandName
      ) {
        return stack[i]
      }
    } else {
      if (stack[i].level === level) {
        return stack[i]
      }
    }
  }
}
