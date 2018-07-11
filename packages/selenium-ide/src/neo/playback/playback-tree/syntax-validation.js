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

import { ControlFlowCommandNames, ControlFlowCommandChecks } from "../../models/Command";
import { State } from "./state";

export function validateControlFlowSyntax(commandStack) {
  let state = new State;
  commandStack.forEach(function(command) {
    if (validateCommand[command.command]) {
      validateCommand[command.command](command.command, state);
    }
  });
  if (!state.empty()) {
    throw new SyntaxError("Incomplete block at " + state.top().command);
  } else {
    return true;
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
  [ControlFlowCommandNames.while]: trackControlFlowBranchOpen
};

function trackControlFlowBranchOpen (commandName, state) {
  state.push({ command: commandName });
}

function validateElse (commandName, state) {
  if (!ControlFlowCommandChecks.isConditional(state.top())) {
    throw new SyntaxError("An else used outside of an if block");
  }
  if (ControlFlowCommandChecks.isElse(state.top())) {
    throw new SyntaxError("Too many else commands used");
  }
  state.push({ command: commandName });
}

function validateElseIf (commandName, state) {
  if (!ControlFlowCommandChecks.isConditional(state.top())) {
    throw new SyntaxError("An else if used outside of an if block");
  }
  if (ControlFlowCommandChecks.isElse(state.top())) {
    throw new SyntaxError("Incorrect command order of else if / else");
  }
  state.push({ command: commandName });
}

function validateEnd (command, state) {
  if (ControlFlowCommandChecks.isBlockOpen(state.top())) {
    state.pop();
  } else if (ControlFlowCommandChecks.isElseOrElseIf(state.top())) {
    state.pop();
    validateEnd(command, state);
  } else {
    throw new SyntaxError("Use of end without an opening keyword");
  }
}

function validateRepeatIf (commandName, state) {
  if (!ControlFlowCommandChecks.isDo(state.top())) {
    throw new SyntaxError("A repeat if used without a do block");
  }
  state.pop();
}
