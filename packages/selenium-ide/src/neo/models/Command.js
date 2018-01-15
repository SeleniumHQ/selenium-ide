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

import { action, computed, observable, extendObservable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Command {
  id = null;
  @observable command = "";
  @observable target = "";
  @observable value = "";

  constructor(id = uuidv4()) {
    this.id = id;
  }

  @computed get isValid() {
    return Commands.array.includes(this.command);
  }

  @action.bound clone() {
    const clone = new Command();
    clone.setCommand(this.command);
    clone.setTarget(this.target);
    clone.setValue(this.value);
    return clone;
  }

  @action.bound setCommand(command) {
    if (Commands.values[command]) {
      this.command = Commands.values[command];
    } else {
      this.command = command;
    }
  }

  @action.bound setTarget(target) {
    this.target = target;
  }

  @action.bound setValue(value) {
    this.value = value.replace(/\n/g, "\\n");
  }

  static fromJS = function(jsRep) {
    const command = new Command(jsRep.id);
    command.setCommand(jsRep.command);
    command.setTarget(jsRep.target);
    command.setValue(jsRep.value);

    return command;
  }
}

class CommandList {
  @observable list = new Map([
    [ "addSelection", "add selection" ],
    [ "answerOnNextPrompt", "answer on next prompt" ],
    [ "assertAlert",  "assert alert" ],
    [ "assertConfirmation", "assert confirmation" ],
    [ "assertPrompt", "assert prompt" ],
    [ "assertText", "assert text" ],
    [ "assertTitle", "assert title" ],
    [ "chooseCancelOnNextConfirmation", "choose cancel on next confirmation" ],
    [ "chooseCancelOnNextPrompt", "choose cancel on next prompt" ],
    [ "chooseOkOnNextConfirmation", "choose ok on next confirmation" ],
    [ "clickAt", "click at" ],
    [ "doubleClickAt", "double click at" ],
    [ "dragAndDropToObject", "drag and drop to object" ],
    [ "echo", "echo" ],
    [ "editContent", "edit content" ],
    [ "mouseDownAt", "mouse down at" ],
    [ "mouseMoveAt", "mouse move at" ],
    [ "mouseOut", "mouse out" ],
    [ "mouseOver", "mouse over" ],
    [ "mouseUpAt", "mouse up at" ],
    [ "open", "open" ],
    [ "pause", "pause" ],
    [ "removeSelection", "remove selection" ],
    [ "runScript", "run script" ],
    [ "select", "select" ],
    [ "selectFrame", "select frame" ],
    [ "selectWindow", "select window" ],
    [ "sendKeys", "send keys" ],
    [ "store", "store" ],
    [ "storeText", "store text" ],
    [ "storeTitle", "store title" ],
    [ "type", "type" ],
    [ "verifyText", "verify text" ],
    [ "verifyTitle", "verify title" ]
  ])

  @computed get array() {
    return this.list.keys();
  }

  @computed get values() {
    return this.array.reduce((commands, command) => {
      commands[this.list.get(command)] = command;
      return commands;
    }, {});
  }

  @action.bound addCommand(id, name) {
    this.list.set(id, name);
  }
}

export const Commands = new CommandList();
