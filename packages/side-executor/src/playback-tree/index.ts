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
import { ControlFlowCommandNames, ControlFlowCommandChecks } from './commands'
import { CommandShape } from '@seleniumhq/side-model'
import { CommandNodeOptions } from '../types'
import { Fn } from '@seleniumhq/side-commons'
export { createPlaybackTree } // public API
export { createCommandNodesFromCommandStack } // for testing

export interface PlaybackTree {
  startingCommandNode: CommandNode
  nodes: CommandNode[]
  containsControlFlow: boolean
}

function createPlaybackTree(
  commandStack: CommandShape[],
  { isValidationDisabled, emitControlFlowChange }: CommandNodeOptions = {}
): PlaybackTree {
  let nodes = createCommandNodesFromCommandStack(
    commandStack,
    isValidationDisabled,
    emitControlFlowChange
  )
  return {
    startingCommandNode: nodes[0],
    nodes,
    containsControlFlow: containsControlFlow(nodes),
  }
}

function containsControlFlow(nodes: CommandNode[]) {
  return !!nodes.filter((node) => node.isControlFlow()).length
}

function createCommandNodesFromCommandStack(
  commandStack: CommandShape[],
  isValidationDisabled: boolean = false,
  emitControlFlowChange?: Fn
) {
  if (!isValidationDisabled) validateControlFlowSyntax(commandStack)
  let levels = deriveCommandLevels(commandStack)
  let nodes = createCommandNodes(commandStack, levels, emitControlFlowChange)
  return connectCommandNodes(nodes)
}

function createCommandNodes(
  commandStack: CommandShape[],
  levels: number[],
  emitControlFlowChange?: Fn
): CommandNode[] {
  let commandNodes: CommandNode[] = []
  commandStack.forEach(function (command, index) {
    let node = new CommandNode(command, { emitControlFlowChange })
    node.index = index
    node.level = levels[index]
    commandNodes.push(node)
  })
  return commandNodes
}

function connectCommandNodes(_commandNodeStack: CommandNode[]): CommandNode[] {
  let commandNodeStack = [..._commandNodeStack]
  let state = new State()
  commandNodeStack.forEach(function (commandNode) {
    let nextCommandNode = commandNodeStack[commandNode.index + 1]
    connectCommandNode({
      commandNode,
      nextCommandNode,
      commandNodeStack,
      state,
    })
  })
  return commandNodeStack
}

export type ConnectFn = (
  commandNode: CommandNode,
  _nextCommandNode: CommandNode,
  stack: CommandNode[],
  state?: any
) => void

const connectDefault: ConnectFn = (
  commandNode,
  _nextCommandNode,
  stack,
  state
) => {
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
  connectNext(commandNode, nextCommandNode as CommandNode)
}

const trackBranchOpen: ConnectFn = (
  commandNode,
  nextCommandNode,
  _stack,
  state
) => {
  state.push({
    command: commandNode.command.command,
    level: commandNode.level,
    index: commandNode.index,
  })
  if (ControlFlowCommandChecks.isDo(commandNode.command))
    connectNext(commandNode, nextCommandNode)
}

const trackBranchClose: ConnectFn = (
  commandNode,
  nextCommandNode,
  stack,
  state
) => {
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
    nextCommandNodeOverride ? nextCommandNodeOverride : nextCommandNode
  )
}

const connectConditionalForBranchOpen: ConnectFn = (
  commandNode,
  nextCommandNode,
  stack,
  state
) => {
  trackBranchOpen(commandNode, nextCommandNode, stack, state)
  connectConditional(commandNode, nextCommandNode, stack)
}

const connectConditional: ConnectFn = (commandNode, nextCommandNode, stack) => {
  let left = findNextNodeBy(stack, commandNode.index, commandNode.level)
  let right = nextCommandNode
  commandNode.right = right
  commandNode.left = left
}

function connectNext(commandNode: CommandNode, nextCommandNode: CommandNode) {
  commandNode.next = nextCommandNode
}

const connectDo: ConnectFn = (commandNode, nextCommandNode, stack, state) => {
  const top = state.top()
  if (!top) repeatIfError()
  commandNode.right = stack[top.index]
  commandNode.left = nextCommandNode
  state.pop()
}

function findNextNodeBy(
  stack: CommandNode[],
  index: number,
  level: number,
  commandName?: string
) {
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
  return undefined
}

function connectCommandNode({
  commandNode,
  nextCommandNode,
  commandNodeStack,
  state,
}: {
  commandNode: CommandNode
  nextCommandNode: CommandNode
  commandNodeStack: CommandNode[]
  state: any
}) {
  if (
    commandNode.command.skip ||
    !commandNodeConnectors[commandNode.command.command]
  ) {
    connectDefault(commandNode, nextCommandNode, commandNodeStack, state)
  } else {
    commandNodeConnectors[commandNode.command.command](
      commandNode,
      nextCommandNode,
      commandNodeStack,
      state
    )
  }
}

const commandNodeConnectors = {
  [ControlFlowCommandNames.do]: trackBranchOpen,
  [ControlFlowCommandNames.else]: connectNext,
  [ControlFlowCommandNames.elseIf]: connectConditional,
  [ControlFlowCommandNames.end]: trackBranchClose,
  [ControlFlowCommandNames.forEach]: connectConditionalForBranchOpen,
  [ControlFlowCommandNames.if]: connectConditionalForBranchOpen,
  [ControlFlowCommandNames.repeatIf]: connectDo,
  [ControlFlowCommandNames.times]: connectConditionalForBranchOpen,
  [ControlFlowCommandNames.try]: connectConditionalForBranchOpen,
  [ControlFlowCommandNames.while]: connectConditionalForBranchOpen,
}
