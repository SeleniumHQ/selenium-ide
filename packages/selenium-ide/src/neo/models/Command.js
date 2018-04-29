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
    [ "addSelection", "add selection" ],
    [ "answerOnNextPrompt", "answer on next prompt" ],
    [ "assertAlert",  "assert alert" ],
    [ "assertChecked", "assert checked" ],
    [ "assertNotChecked", "assert not checked" ],
    [ "assertConfirmation", "assert confirmation" ],
    [ "assertEditable", "assert editable" ],
    [ "assertNotEditable", "assert not editable" ],
    [ "assertElementPresent", "assert element present" ],
    [ "assertElementNotPresent", "assert element not present" ],
    [ "assertPrompt", "assert prompt" ],
    [ "assertSelectedValue", "assert selected value" ],
    [ "assertNotSelectedValue", "assert not selected value" ],
    [ "assertText", "assert text" ],
    [ "assertTitle", "assert title" ],
    [ "assertValue", "assert value" ],
    [ "chooseCancelOnNextConfirmation", "choose cancel on next confirmation" ],
    [ "chooseCancelOnNextPrompt", "choose cancel on next prompt" ],
    [ "chooseOkOnNextConfirmation", "choose ok on next confirmation" ],
    [ "click", "click" ],
    [ "clickAt", "click at" ],
    [ "doubleClick", "double click" ],
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
    [ "setSpeed", "set speed" ],
    [ "store", "store" ],
    [ "storeText", "store text" ],
    [ "storeTitle", "store title" ],
    [ "submit", "submit" ],
    [ "type", "type" ],
    [ "verifyChecked", "verify checked" ],
    [ "verifyNotChecked", "verify not checked" ],
    [ "verifyEditable", "verify editable" ],
    [ "verifyNotEditable", "verify not editable" ],
    [ "verifyElementPresent", "verify element present" ],
    [ "verifyElementNotPresent", "verify element not present" ],
    [ "verifySelectedValue", "verify selected value" ],
    [ "verifyNotSelectedValue", "verify not selected value" ],
    [ "verifyText", "verify text" ],
    [ "verifyTitle", "verify title" ],
    [ "verifyValue", "verify value" ],
    [ "webdriverAnswerOnNextPrompt", "webdriver answer on next prompt" ],
    [ "webdriverChooseCancelOnNextConfirmation", "webdriver choose cancel on next confirmation" ],
    [ "webdriverChooseCancelOnNextPrompt", "webdriver choose cancel on next prompt" ],
    [ "webdriverChooseOkOnNextConfirmation", "webdriver choose ok on next confirmation" ]
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
