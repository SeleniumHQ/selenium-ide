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
  REGION: "region",
  locator: { name: "locator", value: "an element locator" }
  //answer
  //alertText
  //selectLocator
  //locatorOfObjectToBeDragged
  //locatorOfDragDestinationObject
  //url
  //waitTime
  //script
  //window
  //formLocator
  //option
};

export const ValueTypes = {
  //option
  //text
  //coordString
  //locatorOfDragDestinationObject
  //value
}

class CommandList {
  @observable list = new Map([
    [ "addSelection", {
      name: "add selection",
      description: "Add a selection to the set of selected options in a multi-select element using an option locator. @see #doSelect for details of option locators",
      type: TargetTypes.LOCATOR,
      target: "locator - an element locator identifying a multi-select box"
    }],
    [ "answerOnNextPrompt", {
      name: "answer on next prompt",
      description: "Instructs Selenium to return the specified answer string in response to the next JavaScript prompt [window.prompt()].",
      target: "answer - the answer to give in response to the prompt pop-up"
    }],
    [ "assertAlert", {
      name: "assert alert",
      description: "check that an alert has been rendered with the provided text",
      target: "alertText - text to check"
    }],
    [ "assertChecked", {
      name: "assert checked",
      type: TargetTypes.LOCATOR,
      description: "confirm target element has been checked",
      target: "locator - an element locator"
    }],
    [ "assertNotChecked", {
      name: "assert not checked",
      type: TargetTypes.LOCATOR,
      description: "confirm target element has not been checked",
      target: "locator - an element locator"
    }],
    [ "assertConfirmation", {
      name: "assert confirmation",
      description: "check that a confirmation has been rendered"
    }],
    [ "assertEditable", {
      name: "assert editable",
      type: TargetTypes.LOCATOR,
      description: "check that target element is editable",
      target: "locator - an element locator"
    }],
    [ "assertNotEditable", {
      name: "assert not editable",
      type: TargetTypes.LOCATOR,
      description: "check that target element is not editable",
      target: "locator - an element locator"
    }],
    [ "assertElementPresent", {
      name: "assert element present",
      type: TargetTypes.LOCATOR,
      description: "check that target element is present somewhere on the page",
      target: "locator - an element locator"
    }],
    [ "assertElementNotPresent", {
      name: "assert element not present",
      type: TargetTypes.LOCATOR,
      description: "check that target element is not present somewhere on the page",
      target: "locator - an element locator"
    }],
    [ "assertPrompt", {
      name: "assert prompt",
      description: "Check that a JavaScript prompt has been rendered"
    }],
    [ "assertSelectedValue", {
      name: "assert selected value",
      type: TargetTypes.LOCATOR,
      description: "Assert option value (value attribute) for selected option is in the specified select element.",
      target: "selectLocator - an element locator identifying a drop-down menu",
      value: "option - value of the option to check"
    }],
    [ "assertNotSelectedValue", {
      name: "assert not selected value",
      type: TargetTypes.LOCATOR,
      description: "Assert option value (value attribute) for selected option is not in the specified select element.",
      target: "selectLocator - an element locator identifying a drop-down menu"
    }],
    [ "assertSelectedLabel", {
      name: "assert selected label",
      type: TargetTypes.LOCATOR,
      description: "Assert option label (visible text) for selected option in the specified select element.",
      target: "selectLocator - an element locator identifying a drop-down menu"
    }],
    [ "assertText", {
      name: "assert text",
      type: TargetTypes.LOCATOR,
      description: "Assert the text of an element.",
      target: "locator - an element locator",
      value: "text - text to verify"
    }],
    [ "assertNotText", {
      name: "assert not text",
      type: TargetTypes.LOCATOR,
      description: "Assert the text of an element is not present.",
      target: "locator - an element locator"
    }],
    [ "assertTitle", {
      name: "assert title",
      description: "Assert the title of the current page contains the provided text.",
      target: "locator - an element locator"
    }],
    [ "assertValue", {
      name: "assert value",
      type: TargetTypes.LOCATOR,
      description: "Soft assert the (whitespace-trimmed) value of an input field (or anything else with a value parameter). For checkbox/radio elements, the value will be \"on\" or \"off\" depending on whether the element is checked or not.",
      target: "locator - an element locator"
    }],
    [ "chooseCancelOnNextConfirmation", {
      name: "choose cancel on next confirmation",
      description: "By default, Selenium's overridden window.confirm() function will return true, as if the user had manually clicked OK; after running this command, the next call to confirm() will return false, as if the user had clicked Cancel. Selenium will then resume using the default behavior for future confirmations, automatically returning true (OK) unless/until you explicitly call this command for each confirmation. Take note - every time a confirmation comes up, you must consume it with a corresponding getConfirmation, or else the next selenium operation will fail."
    }],
    [ "chooseCancelOnNextPrompt", {
      name: "choose cancel on next prompt",
    }],
    [ "chooseOkOnNextConfirmation", {
      name: "choose ok on next confirmation",
      description: `Undo the effect of calling chooseCancelOnNextConfirmation. Note that Selenium's overridden window.confirm() function will normally automatically return true, as if the user had manually clicked OK, so you shouldn't need to use this command unless for some reason you need to change your mind prior to the next confirmation. After any confirmation, Selenium will resume using the default behavior for future confirmations, automatically returning true (OK) unless/until you explicitly call chooseCancelOnNextConfirmation for each confirmation.

      Take note - every time a confirmation comes up, you must consume it with a corresponding getConfirmation, or else the next selenium operation will fail.`
    }],
    [ "click", {
      name: "click",
      target: TargetTypes.LOCATOR,
      description: "Clicks on a link, button, checkbox or radio button. If the click action causes a new page to load (like a link usually does), call waitForPageToLoad.",
      target: TargetTypes.locator
    }],
    [ "clickAt", {
      name: "click at",
      type: TargetTypes.LOCATOR,
      description: "Clicks on a link, button, checkbox or radio button. If the click action causes a new page to load (like a link usually does), call waitForPageToLoad.",
      target: "locator - an element locator",
      value: "coordString - specifies the x,y position (i.e. - 10,20) of the mouse event relative to the element returned by the locator."
    }],
    [ "check", {
      name: "check",
      type: TargetTypes.LOCATOR,
      description: "Check a toggle-button (checkbox/radio)",
      target: "locator - an element locator"
    }],
    [ "uncheck", {
      name: "uncheck",
      type: TargetTypes.LOCATOR,
      description: "Uncheck a toggle-button (checkbox/radio)",
      target: "locator - an element locator"
    }],
    [ "doubleClick", {
      name: "double click",
      type: TargetTypes.LOCATOR,
      description: "Double clicks on a link, button, checkbox or radio button. If the double click action causes a new page to load (like a link usually does), call waitForPageToLoad.",
      target: "locator - an element locator"
    }],
    [ "doubleClickAt", {
      name: "double click at",
      type: TargetTypes.LOCATOR,
      description: "Doubleclicks on a link, button, checkbox or radio button. If the action causes a new page to load (like a link usually does), call waitForPageToLoad.",
      target: "locator - an element locator",
      value: "coordString - specifies the x,y position (i.e. - 10,20) of the mouse event relative to the element returned by the locator."
    }],
    [ "dragAndDropToObject", {
      name: "drag and drop to object",
      type: TargetTypes.LOCATOR,
      description: "Drags an element and drops it on another element",
      target: "locatorOfObjectToBeDragged - an element to be dragged",
      value: "locatorOfDragDestinationObject - an element whose location (i.e., whose center-most pixel) will be the point where locatorOfObjectToBeDragged is dropped"
    }],
    [ "echo", {
      name: "echo",
      description: "Prints the specified message into the third table cell in your Selenese tables. Useful for debugging.",
      target: "message - the message to print"
    }],
    [ "editContent", {
      name: "edit content",
      type: TargetTypes.LOCATOR,
    }],
    [ "mouseDownAt", {
      name: "mouse down at",
      type: TargetTypes.LOCATOR,
      description: "Simulates a user pressing the left mouse button (without releasing it yet) at the specified location.",
      target: "locator - an element locator",
      value: "coordString - specifies the x,y position (i.e. - 10,20) of the mouse event relative to the element returned by the locator."
    }],
    [ "mouseMoveAt", {
      name: "mouse move at",
      type: TargetTypes.LOCATOR,
      description: "Simulates a user pressing the mouse button (without releasing it yet) on the specified element.",
      target: "locator - an element locator",
      value: "coordString - specifies the x,y position (i.e. - 10,20) of the mouse event relative to the element returned by the locator."
    }],
    [ "mouseOut", {
      name: "mouse out",
      type: TargetTypes.LOCATOR,
      description: "Simulates a user moving the mouse pointer away from the specified element.",
      target: "locator - an element locator"
    }],
    [ "mouseOver", {
      name: "mouse over",
      type: TargetTypes.LOCATOR,
      description: "Simulates a user hovering a mouse over the specified element.",
      target: "locator - an element locator"
    }],
    [ "mouseUpAt", {
      name: "mouse up at",
      type: TargetTypes.LOCATOR,
      description: "Simulates the event that occurs when the user releases the mouse button (i.e., stops holding the button down) at the specified location.",
      target: "locator - an element locator",
      value: "coordString - specifies the x,y position (i.e. - 10,20) of the mouse event relative to the element returned by the locator."
    }],
    [ "open", {
      name: "open",
      description: "Opens an URL in the test frame. This accepts both relative and absolute URLs. The \"open\" command waits for the page to load before proceeding, ie. the \"AndWait\" suffix is implicit. Note: The URL must be on the same domain as the runner HTML due to security restrictions in the browser (Same Origin Policy). If you need to open an URL on another domain, use the Selenium Server to start a new browser session on that domain.",
      target: "url - the URL to open; may be relative or absolute"
    }],
    [ "pause", {
      name: "pause",
      description: "Wait for the specified amount of time (in milliseconds)",
      target: "waitTime - the amount of time to sleep (in milliseconds)"
    }],
    [ "removeSelection", {
      name: "remove selection",
      type: TargetTypes.LOCATOR,
      description: "Remove a selection from the set of selected options in a multi-select element using an option locator. @see #doSelect for details of option locators",
      target: "locator - an element locator identifying a multi-select box"
    }],
    [ "runScript", {
      name: "run script",
      description: "Creates a new \"script\" tag in the body of the current test window, and adds the specified text into the body of the command. Scripts run in this way can often be debugged more easily than scripts executed using Selenium's \"getEval\" command. Beware that JS exceptions thrown in these script tags aren't managed by Selenium, so you should probably wrap your script in try/catch blocks if there is any chance that the script will throw an exception.",
      target: "script - the JavaScript snippet to run"
    }],
    [ "select", {
      name: "select",
      type: TargetTypes.LOCATOR,
      description: `Select an option from a drop-down using an option locator.
Option locators provide different ways of specifying options of an HTML Select element (e.g. for selecting a specific option, or for asserting that the selected option satisfies a specification). There are several forms of Select Option Locator.

label=labelPattern: matches options based on their labels, i.e. the visible text. (This is the default.)
label=regexp:^[Oo]ther
value=valuePattern: matches options based on their values.
value=other
id=id: matches options based on their ids.
id=option1
index=index: matches an option based on its index (offset from zero).
index=2
If no option locator prefix is provided, the default behaviour is to match on label.`,
      target: "selectLocator - an element locator identifying a drop-down menu"
    }],
    [ "selectFrame", {
      name: "select frame",
      type: TargetTypes.LOCATOR,
      description: `Selects a frame within the current window. (You may invoke this command multiple times to select nested frames.) To select the parent frame, use \"relative=parent\" as a locator; to select the top frame, use \"relative=top\". You can also select a frame by its 0-based index number; select the first frame with \"index=0\", or the third frame with \"index=2\".
You may also use a DOM expression to identify the frame you want directly, like this: dom=frames[\"main\"].frames[\"subframe\"]`,
      target: "locator - an element locator identifying a frame or iframe"
    }],
    [ "selectWindow", {
      name: "select window",
      target: "windowID",
      description: `Selects a popup window using a window locator; once a popup window has been selected, all commands go to that window. To select the main window again, use null as the target.
Window locators provide different ways of specifying the window object: by title, by internal JavaScript \"name,\" or by JavaScript variable.

title=My Special Window: Finds the window using the text that appears in the title bar. Be careful; two windows can share the same title. If that happens, this locator will just pick one.
name=myWindow: Finds the window using its internal JavaScript \"name\" property. This is the second parameter \"windowName\" passed to the JavaScript method window.open(url, windowName, windowFeatures, replaceFlag) (which Selenium intercepts).
var=variableName: Some pop-up windows are unnamed (anonymous), but are associated with a JavaScript variable name in the current application window, e.g. \"window.foo = window.open(url);\". In those cases, you can open the window using \"var=foo\".
If no window locator prefix is provided, we'll try to guess what you mean like this:

1.) if windowID is null, (or the string \"null\") then it is assumed the user is referring to the original window instantiated by the browser).

2.) if the value of the \"windowID\" parameter is a JavaScript variable name in the current application window, then it is assumed that this variable contains the return value from a call to the JavaScript window.open() method.

3.) Otherwise, selenium looks in a hash it maintains that maps string names to window \"names\".

4.) If that fails, we'll try looping over all of the known windows to try to find the appropriate \"title\". Since "title" is not necessarily unique, this may have unexpected behavior.

If you're having trouble figuring out the name of a window that you want to manipulate, look at the Selenium log messages which identify the names of windows created via window.open (and therefore intercepted by Selenium). You will see messages like the following for each window as it is opened:

debug: window.open call intercepted; window ID (which you can use with selectWindow()) is \"myNewWindow\"

In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the \"onLoad\" event, for example). (This is bug SEL-339.) In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using an empty (blank) url, like this: openWindow(\"\", \"myFunnyWindow\").`,
      target: "window - the JavaScript window ID of the window to select"
    }],
    [ "sendKeys", {
      name: "send keys",
      type: TargetTypes.LOCATOR,
      description: `Simulates keystroke events on the specified element, as though you typed the value key-by-key.
This simulates a real user typing every character in the specified string; it is also bound by the limitations of a real user, like not being able to type into a invisible or read only elements. This is useful for dynamic UI widgets (like auto-completing combo boxes) that require explicit key events.

Unlike the simple \"type\" command, which forces the specified value into the page directly, this command will not replace the existing content. If you want to replace the existing contents, you need to use the simple \"type\" command to set the value of the field to empty string to clear the field and then the \"sendKeys\" command to send the keystroke for what you want to type.

For those who are interested in the details, unlike the typeKeys command, which tries to fire the keyDown, the keyUp and the keyPress events, this command is backed by the atoms from Selenium 2 and provides a much more robust implementation that will be maintained in the future.`,
      target: "locator - an element locator"
      // 
    }],
    [ "setSpeed", {
      name: "set speed",
      description: "Set execution speed (i.e., set the millisecond length of a delay which will follow each selenium operation). By default, there is no such delay, i.e., the delay is 0 milliseconds.",
      target: "value - the number of milliseconds to pause after operation"
    }],
    [ "store", {
      name: "store",
      description: "This command is a synonym for storeExpression.",
      target: "locator - an element locator",
      value: "value - the value to type"
    }],
    [ "storeText", {
      name: "store text",
      type: TargetTypes.LOCATOR,
      description: "Gets the text of an element. This works for any element that contains text. This command uses either the textContent (Mozilla-like browsers) or the innerText (IE-like browsers) of the element, which is the rendered text shown to the user.",
      target: "locator - an element locator"
    }],
    [ "storeTitle", {
      name: "store title",
      description: "Gets the title of the current page."
    }],
    [ "submit", {
      name: "submit",
      type: TargetTypes.LOCATOR,
      description: "Submit the specified form. This is particularly useful for forms without submit buttons, e.g. single-input \"Search\" forms.",
      target: "formLocator - an element locator for the form you want to submit"
    }],
    [ "type", {
      name: "type",
      type: TargetTypes.LOCATOR,
      description: `Sets the value of an input field, as though you typed it in.
Can also be used to set the value of combo boxes, check boxes, etc. In these cases, value should be the value of the option selected, not the visible text.
      NOTE: Chrome only: No XPath locators.`,
      target: "locator - an element locator",
      value: "value - the value to type"
    }],
    [ "verifyChecked", {
      name: "verify checked",
      type: TargetTypes.LOCATOR,
      description: "verifies whether a toggle-button (checkbox/radio) is checked.",
      target: "locator - an element locator pointing to a checkbox or radio button"
    }],
    [ "verifyNotChecked", {
      name: "verify not checked",
      type: TargetTypes.LOCATOR,
      description: "verifies whether a toggle-button (checkbox/radio) is not checked.",
      target: "locator - an element locator pointing to a checkbox or radio button"
    }],
    [ "verifyEditable", {
      name: "verify editable",
      type: TargetTypes.LOCATOR,
      description: "Soft assert whether the specified input element is editable, ie hasn't been disabled.",
      target: "locator - an element locator",
    }],
    [ "verifyNotEditable", {
      name: "verify not editable",
      type: TargetTypes.LOCATOR,
      description: "Soft assert whether the specified input element is not editable, ie hasn't been disabled.",
      target: "locator - an element locator",
    }],
    [ "verifyElementPresent", {
      name: "verify element present",
      type: TargetTypes.LOCATOR,
      description: "Soft assert that the specified element is somewhere on the page.",
      target: "locator - an element locator"
    }],
    [ "verifyElementNotPresent", {
      name: "verify element not present",
      type: TargetTypes.LOCATOR,
      description: "Soft assert that the specified element is not somewhere on the page.",
      target: "locator - an element locator"
    }],
    [ "verifySelectedValue", {
      name: "verify selected value",
      type: TargetTypes.LOCATOR,
      description: "Soft assert option value (value attribute) for selected option is in the specified select element.",
      target: "selectLocator - an element locator identifying a drop-down menu",
      value: "option - value of the option to check"
    }],
    [ "verifyNotSelectedValue", {
      name: "verify not selected value",
      type: TargetTypes.LOCATOR,
      description: "Soft assert option value (value attribute) for selected option is not in the specified select element.",
      target: "selectLocator - an element locator identifying a drop-down menu"
    }],
    [ "verifyText", {
      name: "verify text",
      type: TargetTypes.LOCATOR,
      description: "Soft assert the text of an element.",
      target: "locator - an element locator",
      value: "text - text to verify"
    }],
    [ "verifyNotText", {
      name: "verify not text",
      type: TargetTypes.LOCATOR,
      description: "Soft assert the text of an element is not present.",
      target: "locator - an element locator"
    }],
    [ "verifyTitle", {
      name: "verify title",
      description: "Soft assert the title of the current page contains the provided text.",
      target: "locator - an element locator"
    }],
    [ "verifyValue", {
      name: "verify value",
      type: TargetTypes.LOCATOR,
      description: "Soft assert the (whitespace-trimmed) value of an input field (or anything else with a value parameter). For checkbox/radio elements, the value will be \"on\" or \"off\" depending on whether the element is checked or not.",
      target: "locator - an element locator"
    }],
    [ "verifySelectedLabel", {
      name: "verify selected label",
      type: TargetTypes.LOCATOR,
      description: "Soft assert option label (visible text) for selected option in the specified select element.",
      target: "selectLocator - an element locator identifying a drop-down menu"
    }],
    [ "webdriverAnswerOnNextPrompt", {
      name: "webdriver answer on next prompt",
      description: "Instructs Selenium to return the specified answer string in response to the next JavaScript prompt [window.prompt()].",
      target: "answer - the answer to give in response to the prompt pop-up"
    }],
    [ "webdriverChooseCancelOnNextConfirmation", {
      name: "webdriver choose cancel on next confirmation",
      description: `By default, Selenium's overridden window.confirm() function will return true, as if the user had manually clicked OK; after running this command, the next call to confirm() will return false, as if the user had clicked Cancel. Selenium will then resume using the default behavior for future confirmations, automatically returning true (OK) unless/until you explicitly call this command for each confirmation.

Take note - every time a confirmation comes up, you must consume it with a corresponding getConfirmation, or else the next selenium operation will fail.`
    }],
    [ "webdriverChooseCancelOnNextPrompt", {
      name: "webdriver choose cancel on next prompt",
      description: "Instructs Selenium to cancel the next JavaScript prompt."
    }],
    [ "webdriverChooseOkOnNextConfirmation", {
      name: "webdriver choose ok on next confirmation",
      description: `Undo the effect of calling chooseCancelOnNextConfirmation. Note that Selenium's overridden window.confirm() function will normally automatically return true, as if the user had manually clicked OK, so you shouldn't need to use this command unless for some reason you need to change your mind prior to the next confirmation. After any confirmation, Selenium will resume using the default behavior for future confirmations, automatically returning true (OK) unless/until you explicitly call chooseCancelOnNextConfirmation for each confirmation.

Take note - every time a confirmation comes up, you must consume it with a corresponding getConfirmation, or else the next selenium operation will fail.`
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
