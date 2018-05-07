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

import { action, computed, observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Command {
  id = null;
  @observable comment = "";
  @observable command = "";
  @observable target = "";
  @observable value = "";
  @observable isBreakpoint = false;

  constructor(id = uuidv4()) {
    this.id = id;
    this.export = this.export.bind(this);
  }

  @computed get isValid() {
    return Commands.array.includes(this.command);
  }

  @action.bound clone() {
    const clone = new Command();
    clone.setComment(this.comment);
    clone.setCommand(this.command);
    clone.setTarget(this.target);
    clone.setValue(this.value);
    return clone;
  }

  @action.bound setComment(comment) {
    this.comment = comment || "";
  }

  @action.bound setCommand(command) {
    if (Commands.values[command]) {
      this.command = Commands.values[command];
    } else {
      this.command = command || "";
    }
  }

  @action.bound setTarget(target) {
    this.target = target || "";
  }

  @action.bound setValue(value) {
    this.value = value ? value.replace(/\n/g, "\\n") : "";
  }

  @action.bound toggleBreakpoint() {
    this.isBreakpoint = !this.isBreakpoint;
  }

  export() {
    return {
      id: this.id,
      comment: this.comment,
      command: this.command,
      target: this.target,
      value: this.value
    };
  }

  static fromJS = function(jsRep) {
    const command = new Command(jsRep.id);
    command.setComment(jsRep.comment);
    command.setCommand(jsRep.command);
    command.setTarget(jsRep.target);
    command.setValue(jsRep.value);

    return command;
  }
}

class CommandList {
  @observable list = new Map([
    [ "addSelection", {
      name: "add selection"
    }],
    [ "answerOnNextPrompt", {
      name: "answer on next prompt"
    }],
    [ "assertAlert",  {
      name: "assert alert"
    }],
    [ "assertChecked", {
      name: "assert checked"
    }],
    [ "assertNotChecked", {
      name: "assert not checked"
    }],
    [ "assertConfirmation", {
      name: "assert confirmation"
    }],
    [ "assertEditable", {
      name: "assert editable"
    }],
    [ "assertNotEditable", {
      name: "assert not editable"
    }],
    [ "assertElementPresent", {
      name: "assert element present"
    }],
    [ "assertElementNotPresent", {
      name: "assert element not present"
    }],
    [ "assertPrompt", {
      name: "assert prompt"
    }],
    [ "assertSelectedValue", {
      name: "assert selected value"
    }],
    [ "assertNotSelectedValue", {
      name: "assert not selected value"
    }],
    [ "assertText", {
      name: "assert text"
    }],
    [ "assertTitle", {
      name: "assert title"
    }],
    [ "assertValue", {
      name: "assert value"
    }],
    [ "chooseCancelOnNextConfirmation", {
      name: "choose cancel on next confirmation"
    }],
    [ "chooseCancelOnNextPrompt", {
      name: "choose cancel on next prompt"
    }],
    [ "chooseOkOnNextConfirmation", {
      name: "choose ok on next confirmation"
    }],
    [ "click", {
      name: "click"
    }],
    [ "clickAt", {
      name: "click at"
    }],
    [ "doubleClick", {
      name: "double click"
    }],
    [ "doubleClickAt", {
      name: "double click at"
    }],
    [ "dragAndDropToObject", {
      name: "drag and drop to object"
    }],
    [ "echo", {
      name: "echo"
    }],
    [ "editContent", {
      name: "edit content"
    }],
    [ "mouseDownAt", {
      name: "mouse down at"
    }],
    [ "mouseMoveAt", {
      name: "mouse move at"
    }],
    [ "mouseOut", {
      name: "mouse out"
    }],
    [ "mouseOver", {
      name: "mouse over"
    }],
    [ "mouseUpAt", {
      name: "mouse up at"
    }],
    [ "open", {
      name: "open"
    }],
    [ "pause", {
      name: "pause"
    }],
    [ "removeSelection", {
      name: "remove selection"
    }],
    [ "runScript", {
      name: "run script"
    }],
    [ "select", {
      name: "select"
    }],
    [ "selectFrame", {
      name: "select frame"
    }],
    [ "selectWindow", {
      name: "select window"
    }],
    [ "sendKeys", {
      name: "send keys"
    }],
    [ "setSpeed", {
      name: "set speed"
    }],
    [ "store", {
      name: "store"
    }],
    [ "storeText", {
      name: "store text"
    }],
    [ "storeTitle", {
      name: "store title"
    }],
    [ "submit", {
      name: "submit"
    }],
    [ "type", {
      name: "type"
    }],
    [ "verifyChecked", {
      name: "verify checked"
    }],
    [ "verifyNotChecked", {
      name: "verify not checked"
    }],
    [ "verifyEditable", {
      name: "verify editable"
    }],
    [ "verifyNotEditable", {
      name: "verify not editable"
    }],
    [ "verifyElementPresent", {
      name: "verify element present"
    }],
    [ "verifyElementNotPresent", {
      name: "verify element not present"
    }],
    [ "verifySelectedValue", {
      name: "verify selected value"
    }],
    [ "verifyNotSelectedValue", {
      name: "verify not selected value"
    }],
    [ "verifyText", {
      name: "verify text"
    }],
    [ "verifyTitle", {
      name: "verify title"
    }],
    [ "verifyValue", {
      name: "verify value"
    }],
    [ "webdriverAnswerOnNextPrompt", {
      name: "webdriver answer on next prompt"
    }],
    [ "webdriverChooseCancelOnNextConfirmation", {
      name: "webdriver choose cancel on next confirmation"
    }],
    [ "webdriverChooseCancelOnNextPrompt", {
      name: "webdriver choose cancel on next prompt"
    }],
    [ "webdriverChooseOkOnNextConfirmation", {
      name: "webdriver choose ok on next confirmation"
    }]
  ])

  @computed get array() {
    return this.list.keys();
  }

  @computed get values() {
    return this.array.reduce((commands, command) => {
      commands[this.list.get(command).name] = command;
      return commands;
    }, {});
  }

  @action.bound addCommand(id, name) {
    if (this.list.has(id)) {
      throw new Error(`Command with the id ${id} already exists`);
    } else {
      this.list.set(id, name);
    }
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new CommandList();
    }
    return this._instance;
  }
}

export const Commands = CommandList.instance;
