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

import {
  ControlFlowCommandNames,
  ControlFlowCommandChecks,
} from '../../models/Command'
import { State } from './state'
import { ControlFlowSyntaxError } from './control-flow-syntax-error'

export function validateControlFlowSyntax(commandStack) {
  let state = new State()
  commandStack.forEach(function(command, commandIndex) {
    if (validateCommand[command.command]) {
      validateCommand[command.command](command.command, commandIndex, state)
    }
  })
  if (!state.empty()) {
    throw new ControlFlowSyntaxError(
      'Incomplete block at ' + state.top().command,
      state.top().index
    )
  } else {
    return true
  }
}

const validateCommand = {
  [ControlFlowCommandNames.do]: trackControlFlowBranchOpen,
  [ControlFlowCommandNames.else]: validateElse,
  [ControlFlowCommandNames.elseIf]: validateElseIf,
  [ControlFlowCommandNames.end]: validateEnd,
  [ControlFlowCommandNames.if]: trackControlFlowBranchOpen,
  [ControlFlowCommandNames.repeatIf]: validateRepeatIf,
  [ControlFlowCommandNames.times]: trackControlFlowBranchOpen,
  [ControlFlowCommandNames.while]: trackControlFlowBranchOpen,
}

function trackControlFlowBranchOpen(commandName, commandIndex, state) {
  state.push({ command: commandName, index: commandIndex })
}

function validateElse(commandName, commandIndex, state) {
  if (!ControlFlowCommandChecks.isIfBlock(state.top())) {
    throw new ControlFlowSyntaxError(
      'An else used outside of an if block',
      commandIndex
    )
  }
  if (ControlFlowCommandChecks.isElse(state.top())) {
    throw new ControlFlowSyntaxError(
      'Too many else commands used',
      commandIndex
    )
  }
  state.push({ command: commandName, index: commandIndex })
}

function validateElseIf(commandName, commandIndex, state) {
  if (!ControlFlowCommandChecks.isIfBlock(state.top())) {
    throw new ControlFlowSyntaxError(
      'An else if used outside of an if block',
      commandIndex
    )
  }
  if (ControlFlowCommandChecks.isElse(state.top())) {
    throw new ControlFlowSyntaxError(
      'Incorrect command order of else if / else',
      commandIndex
    )
  }
  state.push({ command: commandName, index: commandIndex })
}

function validateEnd(commandName, commandIndex, state) {
  if (ControlFlowCommandChecks.isBlockOpen(state.top())) {
    state.pop()
  } else if (ControlFlowCommandChecks.isElseOrElseIf(state.top())) {
    state.pop()
    validateEnd(commandName, commandIndex, state)
  } else {
    throw new ControlFlowSyntaxError(
      'Use of end without an opening keyword',
      commandIndex
    )
  }
}

function validateRepeatIf(_commandName, commandIndex, state) {
  if (!ControlFlowCommandChecks.isDo(state.top())) {
    throw new ControlFlowSyntaxError(
      'A repeat if used without a do block',
      commandIndex
    )
  }
  state.pop()
}
