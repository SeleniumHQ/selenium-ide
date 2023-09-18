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

import { CommandShape } from '@seleniumhq/side-model'

export const ControlFlowCommandNames = {
  do: 'do',
  else: 'else',
  elseIf: 'elseIf',
  end: 'end',
  forEach: 'forEach',
  if: 'if',
  repeatIf: 'repeatIf',
  times: 'times',
  try: 'try',
  while: 'while',
}

function commandNamesEqual(command: CommandShape, target: string) {
  if (command) {
    return command.command === target
  } else {
    return false
  }
}

function isCommandEnabled(command: CommandShape) {
  return command && !command.skip
}

function isBlockOpen(command: CommandShape) {
  return (
    isCommandEnabled(command) &&
    (isIf(command) || isLoop(command) || isTry(command))
  )
}

function isConditional(command: CommandShape) {
  if (!isCommandEnabled(command)) return false

  switch (command.command) {
    case ControlFlowCommandNames.elseIf:
    case ControlFlowCommandNames.if:
    case ControlFlowCommandNames.repeatIf:
    case ControlFlowCommandNames.times:
    case ControlFlowCommandNames.while:
      return true
    default:
      return false
  }
}

function isControlFlow(command: CommandShape) {
  if (!isCommandEnabled(command)) return false

  switch (command.command) {
    case ControlFlowCommandNames.if:
    case ControlFlowCommandNames.elseIf:
    case ControlFlowCommandNames.else:
    case ControlFlowCommandNames.end:
    case ControlFlowCommandNames.do:
    case ControlFlowCommandNames.repeatIf:
    case ControlFlowCommandNames.times:
    case ControlFlowCommandNames.try:
    case ControlFlowCommandNames.while:
      return true
    default:
      return false
  }
}

function isDo(command: CommandShape) {
  return (
    isCommandEnabled(command) &&
    commandNamesEqual(command, ControlFlowCommandNames.do)
  )
}

function isElse(command: CommandShape) {
  return (
    isCommandEnabled(command) &&
    commandNamesEqual(command, ControlFlowCommandNames.else)
  )
}

function isElseIf(command: CommandShape) {
  return (
    isCommandEnabled(command) &&
    commandNamesEqual(command, ControlFlowCommandNames.elseIf)
  )
}

function isElseOrElseIf(command: CommandShape) {
  return isCommandEnabled(command) && (isElseIf(command) || isElse(command))
}

function isEnd(command: CommandShape) {
  return (
    isCommandEnabled(command) &&
    commandNamesEqual(command, ControlFlowCommandNames.end)
  )
}

function isIf(command: CommandShape) {
  return (
    isCommandEnabled(command) &&
    commandNamesEqual(command, ControlFlowCommandNames.if)
  )
}

function isIfBlock(command: CommandShape) {
  return isCommandEnabled(command) && (isIf(command) || isElseOrElseIf(command))
}

function isLoop(command: CommandShape) {
  if (!isCommandEnabled(command)) return false

  return (
    commandNamesEqual(command, ControlFlowCommandNames.while) ||
    commandNamesEqual(command, ControlFlowCommandNames.times) ||
    commandNamesEqual(command, ControlFlowCommandNames.repeatIf) ||
    commandNamesEqual(command, ControlFlowCommandNames.forEach)
  )
}

function isTerminal(command: CommandShape) {
  return (
    isCommandEnabled(command) &&
    (isElse(command) || isDo(command) || isEnd(command))
  )
}

function isTimes(command: CommandShape) {
  return (
    isCommandEnabled(command) &&
    commandNamesEqual(command, ControlFlowCommandNames.times)
  )
}

function isTry(command: CommandShape) {
  return (
    isCommandEnabled(command) &&
    commandNamesEqual(command, ControlFlowCommandNames.try)
  )
}

function isForEach(command: CommandShape) {
  return (
    isCommandEnabled(command) &&
    commandNamesEqual(command, ControlFlowCommandNames.forEach)
  )
}

export const ControlFlowCommandChecks = {
  isIfBlock,
  isConditional,
  isDo,
  isElse,
  isElseOrElseIf,
  isEnd,
  isIf,
  isLoop,
  isBlockOpen,
  isTerminal,
  isControlFlow,
  isTimes,
  isForEach,
  isTry,
}
