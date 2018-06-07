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
    clone.setData(this.export());
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

  @action.bound setData(jsRep){
    this.setComment(jsRep.comment);
    this.setCommand(jsRep.command);
    this.setTarget(jsRep.target);
    this.setValue(jsRep.value);
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
    command.setData(jsRep);
    return command;
  }
}

export const TargetTypes = {
  NONE: 0,
  LOCATOR: "locator",
  REGION: "region"
};

class CommandList {
  @observable list = new Map([
    [ "addSelection", {
      name: "add selection",
      type: TargetTypes.LOCATOR
    }],
    [ "answerOnNextPrompt", {
      name: "answer on next prompt"
    }],
    [ "assertAlert", {
      name: "assert alert"
    }],
    [ "assertChecked", {
      name: "assert checked",
      type: TargetTypes.LOCATOR
    }],
    [ "assertNotChecked", {
      name: "assert not checked",
      type: TargetTypes.LOCATOR
    }],
    [ "assertConfirmation", {
      name: "assert confirmation"
    }],
    [ "assertEditable", {
      name: "assert editable",
      type: TargetTypes.LOCATOR
    }],
    [ "assertNotEditable", {
      name: "assert not editable",
      type: TargetTypes.LOCATOR
    }],
    [ "assertElementPresent", {
      name: "assert element present",
      type: TargetTypes.LOCATOR
    }],
    [ "assertElementNotPresent", {
      name: "assert element not present",
      type: TargetTypes.LOCATOR
    }],
    [ "assertPrompt", {
      name: "assert prompt"
    }],
    [ "assertSelectedValue", {
      name: "assert selected value",
      type: TargetTypes.LOCATOR
    }],
    [ "assertNotSelectedValue", {
      name: "assert not selected value",
      type: TargetTypes.LOCATOR
    }],
    [ "assertSelectedLabel", {
      name: "assert selected label",
      type: TargetTypes.LOCATOR
    }],
    [ "assertText", {
      name: "assert text",
      type: TargetTypes.LOCATOR
    }],
    [ "assertNotText", {
      name: "assert not text",
      type: TargetTypes.LOCATOR
    }],
    [ "assertTitle", {
      name: "assert title"
    }],
    [ "assertValue", {
      name: "assert value",
      type: TargetTypes.LOCATOR
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
      name: "click",
      type: TargetTypes.LOCATOR
    }],
    [ "clickAt", {
      name: "click at",
      type: TargetTypes.LOCATOR
    }],
    [ "check", {
      name: "check",
      type: TargetTypes.LOCATOR
    }],
    [ "uncheck", {
      name: "uncheck",
      type: TargetTypes.LOCATOR
    }],
    [ "doubleClick", {
      name: "double click",
      type: TargetTypes.LOCATOR
    }],
    [ "doubleClickAt", {
      name: "double click at",
      type: TargetTypes.LOCATOR
    }],
    [ "dragAndDropToObject", {
      name: "drag and drop to object",
      type: TargetTypes.LOCATOR
    }],
    [ "echo", {
      name: "echo"
    }],
    [ "editContent", {
      name: "edit content",
      type: TargetTypes.LOCATOR
    }],
    [ "mouseDownAt", {
      name: "mouse down at",
      type: TargetTypes.LOCATOR
    }],
    [ "mouseMoveAt", {
      name: "mouse move at",
      type: TargetTypes.LOCATOR
    }],
    [ "mouseOut", {
      name: "mouse out",
      type: TargetTypes.LOCATOR
    }],
    [ "mouseOver", {
      name: "mouse over",
      type: TargetTypes.LOCATOR
    }],
    [ "mouseUpAt", {
      name: "mouse up at",
      type: TargetTypes.LOCATOR
    }],
    [ "open", {
      name: "open"
    }],
    [ "pause", {
      name: "pause"
    }],
    [ "removeSelection", {
      name: "remove selection",
      type: TargetTypes.LOCATOR
    }],
    [ "runScript", {
      name: "run script"
    }],
    [ "select", {
      name: "select",
      type: TargetTypes.LOCATOR
    }],
    [ "selectFrame", {
      name: "select frame",
      type: TargetTypes.LOCATOR
    }],
    [ "selectWindow", {
      name: "select window"
    }],
    [ "sendKeys", {
      name: "send keys",
      type: TargetTypes.LOCATOR
    }],
    [ "setSpeed", {
      name: "set speed"
    }],
    [ "store", {
      name: "store"
    }],
    [ "storeText", {
      name: "store text",
      type: TargetTypes.LOCATOR
    }],
    [ "storeTitle", {
      name: "store title"
    }],
    [ "submit", {
      name: "submit",
      type: TargetTypes.LOCATOR
    }],
    [ "type", {
      name: "type",
      type: TargetTypes.LOCATOR
    }],
    [ "verifyChecked", {
      name: "verify checked",
      type: TargetTypes.LOCATOR
    }],
    [ "verifyNotChecked", {
      name: "verify not checked",
      type: TargetTypes.LOCATOR
    }],
    [ "verifyEditable", {
      name: "verify editable",
      type: TargetTypes.LOCATOR
    }],
    [ "verifyNotEditable", {
      name: "verify not editable",
      type: TargetTypes.LOCATOR
    }],
    [ "verifyElementPresent", {
      name: "verify element present",
      type: TargetTypes.LOCATOR
    }],
    [ "verifyElementNotPresent", {
      name: "verify element not present",
      type: TargetTypes.LOCATOR
    }],
    [ "verifySelectedValue", {
      name: "verify selected value",
      type: TargetTypes.LOCATOR
    }],
    [ "verifyNotSelectedValue", {
      name: "verify not selected value",
      type: TargetTypes.LOCATOR
    }],
    [ "verifyText", {
      name: "verify text",
      type: TargetTypes.LOCATOR
    }],
    [ "verifyNotText", {
      name: "verify not text",
      type: TargetTypes.LOCATOR
    }],
    [ "verifyTitle", {
      name: "verify title"
    }],
    [ "verifyValue", {
      name: "verify value",
      type: TargetTypes.LOCATOR
    }],
    [ "verifySelectedLabel", {
      name: "verify selected label",
      type: TargetTypes.LOCATOR
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
