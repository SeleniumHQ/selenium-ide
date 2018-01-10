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

reaction(
  () => UiState.isRecording,
  isRecording => { window.isRecording = isRecording; }
);

function isEmpty(commands, command) {
  return (commands.length === 0 && command === "open");
}

window.getRecordsArray = function() {
  return [];
};

window.addCommandAuto = function(command, targets, value) {
  const { test } = UiState.selectedTest;
  if (isEmpty(test.commands, command)) {
    const newCommand = test.createCommand();
    newCommand.setCommand(command);
    newCommand.setValue(value);
    const url = new URL(targets);
    UiState.setUrl(url.origin, true);
    newCommand.setTarget(url.pathname);
  } else if (command !== "open") {
    const newCommand = UiState.selectedCommand !== UiState.pristineCommand
      ? test.createCommand(UiState.selectedTest.test.commands.indexOf(UiState.selectedCommand))
      : test.createCommand();
    newCommand.setCommand(command);
    newCommand.setValue(value);
    newCommand.setTarget(targets[0][0]);
  }
};
