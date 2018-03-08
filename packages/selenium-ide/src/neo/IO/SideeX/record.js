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

import { reaction } from "mobx";
import UiState from "../../stores/view/UiState";
import { toggleRecord } from "./editor";

reaction(
  () => UiState.isRecording,
  isRecording => {
    toggleRecord(isRecording);
  }
);

function isEmpty(commands, command) {
  return (commands.length === 0 && command === "open");
}

export default function record(command, targets, value, insertBeforeLastCommand = false) {
  const { test } = UiState.selectedTest;
  if (isEmpty(test.commands, command)) {
    const newCommand = test.createCommand();
    newCommand.setCommand(command);
    newCommand.setValue(value);
    const url = new URL(targets);
    UiState.setUrl(url.origin, true);
    newCommand.setTarget(url.pathname);
  } else if (command !== "open") {
    let index = undefined;
    if (insertBeforeLastCommand) {
      index = test.commands.length - 1;
    } else if(UiState.selectedCommand !== UiState.pristineCommand) {
      index = test.commands.indexOf(UiState.selectedCommand);
    }
    if (preprocessDoubleClick(command, test, index)) {
      // double click removed the 2 clicks from before
      index -= 2;
    }
    const newCommand = test.createCommand(index);
    newCommand.setCommand(command);
    newCommand.setValue(value);
    newCommand.setTarget(targets[0][0]);
  }
}

function preprocessDoubleClick(command, test, index) {
  if (command === "doubleClickAt" && test.commands.length >= 1) {
    const lastCommand = test.commands[index - 1];
    const beforeLastCommand = test.commands[index - 2];
    if (lastCommand.command === "clickAt" &&
      lastCommand.command === beforeLastCommand.command &&
      lastCommand.target === beforeLastCommand.target &&
      lastCommand.value === beforeLastCommand.value) {
      test.removeCommand(lastCommand);
      test.removeCommand(beforeLastCommand);
      return true;
    }
  }
  return false;
}
