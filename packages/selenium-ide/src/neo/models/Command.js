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

import { action, computed, observable, toJS } from "mobx";
import uuidv4 from "uuid/v4";

export default class Command {
  id = null;
  @observable comment = "";
  @observable command;
  @observable target;
  @observable targets = [];
  @observable value;
  @observable isBreakpoint = false;

  constructor(id = uuidv4(), command, target, value) {
    this.id = id;
    this.command = command || "";
    this.target = target || "";
    this.value = value || "";
    this.export = this.export.bind(this);
  }

  @computed get displayedName() {
    return (this.enabled ? this.command : this.command.substr(2));
  }

  @computed get enabled() {
    return (this.command && !this.command.startsWith("//"));
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

  @action.bound setTargets(targets = []) {
    this.targets.replace(targets);
  }

  @action.bound setValue(value) {
    this.value = value ? value.replace(/\n/g, "\\n") : "";
  }

  @action.bound toggleBreakpoint() {
    this.isBreakpoint = !this.isBreakpoint;
  }

  @action.bound toggleEnabled() {
    if (this.enabled) {
      this.setCommand("//" + this.command);
    } else {
      this.setCommand(this.command.substr(2));
    }
  }

  @action.bound setData(jsRep){
    this.setComment(jsRep.comment);
    this.setCommand(jsRep.command);
    this.setTarget(jsRep.target);
    this.setTargets(jsRep.targets);
    this.setValue(jsRep.value);
  }

  export() {
    return {
      id: this.id,
      comment: this.comment,
      command: this.command,
      target: this.target,
      targets: toJS(this.targets),
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

export const ArgTypes = {
  answer: {
    name: "answer",
    description: "The answer to give in response to the prompt pop-up."
  },
  alertText: {
    name: "alert text",
    description: "text to check"
  },
  attributeLocator: {
    name: "attribute locator",
    description: "An element locator followed by an @ sign and then the name \
                  of the attribute, e.g. \"foo@bar\"."
  },
  conditionalExpression: {
    name: "conditional expression",
    description: "JavaScript expression that returns a boolean result for use \
                  in control flow commands."
  },
  coord: {
    name: "coord String",
    description: "Specifies the x,y position (e.g., - 10,20) of the mouse event \
                  relative to the element found from a locator."
  },
  expectedValue: {
    name: "expected value",
    description: "The result you expect a variable to contain (e.g., true, false,\
                  or some other value)."
  },
  expression: {
    name: "expression",
    description: "The value you'd like to store."
  },
  formLocator: {
    name: "form locator",
    description: "An element locator for the form you want to submit."
  },
  keySequence: {
    name: "key sequence",
    description: "A sequence of keys to type, can be used to send key strokes (e.g.\
                  ${KEY_ENTER})."
  },
  locator: {
    name: "locator",
    description: "An element locator."
  },
  locatorOfObjectToBeDragged: {
    name: "locator of object to be dragged",
    description: "The locator of element to be dragged."
  },
  locatorOfDragDestinationObject: {
    name: "locator of drag destination object",
    description: "The locator of an element whose location (e.g., the center-most \
                  pixel within it) will be the point where locator of object to be \
                  dragged is dropped."
  },
  optionLocator: {
    name: "option",
    description: "An option locator, typically just an option label (e.g. \"John Smith\")."
  },
  message: {
    name: "message",
    value: "The message to print."
  },
  pattern: {
    name: "text",
    description: "An exact string match. Support for pattern matching is in the \
                  works. See https://github.com/SeleniumHQ/selenium-ide/issues/141 \
                  for details."
  },
  region: {
    name: "region",
    description: "Specify a rectangle with coordinates and lengths (e.g., \"x: \
                  257, y: 300, width: 462, height: 280\")."
  },
  resolution: {
    name: "resolution",
    description: "Specify a window resolution using WidthxHeight. (e.g., \
                  1280x800)."
  },
  script: {
    name: "script",
    description: "The JavaScript snippet to run."
  },
  selectLocator: {
    name: "select locator",
    description: "An element locator identifying a drop-down menu."
  },
  testCase: {
    name: "test case",
    description: "Test case name from the project."
  },
  text: {
    name: "text",
    description: "The text to verify."
  },
  times: {
    name: "times",
    description: "The number of attempts a times control flow loop will execute \
                  the commands within its block."
  },
  url: {
    name: "url",
    description: "The URL to open (may be relative or absolute)."
  },
  value: {
    name: "value",
    description: "The value to type."
  },
  variableName: {
    name: "variable name",
    description: "The name of a variable (without brackets). Used to either store an \
                  expression's result in or reference for a check (e.g., \
                  with 'assert' or 'verify')."
  },
  waitTime: {
    name: "wait time",
    description: "The amount of time to wait (in milliseconds)."
  },
  window: {
    name: "window",
    description: "The id of the browser window to select."
  },
  xpath: {
    name: "xpath",
    description: "The xpath expression to evaluate."
  }
};

class CommandList {
  @observable list = new Map([
    [ "addSelection", {
      name: "add selection",
      description: "Add a selection to the set of options in a multi-select element.",
      type: TargetTypes.LOCATOR,
      target: ArgTypes.locator
    }],
    [ "answerOnNextPrompt", {
      name: "answer on next prompt",
      description: "Affects the next alert prompt. This command will send \
                    the specified answer string to it. If the alert is already \
                    present, then use \"webdriver answer on visible prompt\" instead.",
      target: ArgTypes.answer
    }],
    [ "assert", {
      name: "assert",
      description: "Check that a variable is an expected value. The variable's value will be converted to a string for comparison.",
      target: ArgTypes.variableName,
      value: ArgTypes.expectedValue
    }],
    [ "assertAlert", {
      name: "assert alert",
      description: "Confirm that an alert has been rendered with the provided text.",
      target: ArgTypes.alertText
    }],
    [ "assertChecked", {
      name: "assert checked",
      type: TargetTypes.LOCATOR,
      description: "Confirm that the target element has been checked.",
      target: ArgTypes.locator
    }],
    [ "assertNotChecked", {
      name: "assert not checked",
      type: TargetTypes.LOCATOR,
      description: "Confirm that the target element has not been checked.",
      target: ArgTypes.locator
    }],
    [ "assertConfirmation", {
      name: "assert confirmation",
      description: "Confirm that a confirmation has been rendered."
    }],
    [ "assertEditable", {
      name: "assert editable",
      type: TargetTypes.LOCATOR,
      description: "Confirm that the target element is editable.",
      target: ArgTypes.locator
    }],
    [ "assertNotEditable", {
      name: "assert not editable",
      type: TargetTypes.LOCATOR,
      description: "Confirm that the target element is not editable.",
      target: ArgTypes.locator
    }],
    [ "assertElementPresent", {
      name: "assert element present",
      type: TargetTypes.LOCATOR,
      description: "Confirm that the target element is present somewhere on the page.",
      target: ArgTypes.locator
    }],
    [ "assertElementNotPresent", {
      name: "assert element not present",
      type: TargetTypes.LOCATOR,
      description: "Confirm that the target element is not present anywhere on the page.",
      target: ArgTypes.locator
    }],
    [ "assertPrompt", {
      name: "assert prompt",
      description: "Confirm that a JavaScript prompt has been rendered."
    }],
    [ "assertSelectedValue", {
      name: "assert selected value",
      type: TargetTypes.LOCATOR,
      description: "Confirm that the value attribute of the selected option in \
                    a dropdown element contains the provided value.",
      target: ArgTypes.selectLocator,
      value: ArgTypes.pattern
    }],
    [ "assertNotSelectedValue", {
      name: "assert not selected value",
      type: TargetTypes.LOCATOR,
      description: "Confirm that the value attribute of the selected option in \
                    a dropdown element does not contain the provided value.",
      target: ArgTypes.selectLocator,
      value: ArgTypes.pattern
    }],
    [ "assertSelectedLabel", {
      name: "assert selected label",
      type: TargetTypes.LOCATOR,
      description: "Confirm that the label of the selected option in a dropdown \
                    element contains the provided value.",
      target: ArgTypes.selectLocator,
      value: ArgTypes.pattern
    }],
    [ "assertText", {
      name: "assert text",
      type: TargetTypes.LOCATOR,
      description: "Confirm that the text of an element contains the provided value.",
      target: ArgTypes.locator,
      value: ArgTypes.pattern
    }],
    [ "assertNotText", {
      name: "assert not text",
      type: TargetTypes.LOCATOR,
      description: "Confirm that the text of an element does not contain the provided value.",
      target: ArgTypes.locator,
      value: ArgTypes.pattern
    }],
    [ "assertTitle", {
      name: "assert title",
      description: "Confirm the title of the current page contains the provided text.",
      target: ArgTypes.pattern
    }],
    [ "assertValue", {
      name: "assert value",
      type: TargetTypes.LOCATOR,
      description: "Confirm the (whitespace-trimmed) value of an input field (or \
                    anything else with a value parameter). For checkbox/radio \
                    elements, the value will be \"on\" or \"off\" depending on \
                    whether the element is checked or not.",
      target: ArgTypes.locator,
      value: ArgTypes.pattern
    }],
    [ "chooseCancelOnNextConfirmation", {
      name: "choose cancel on next confirmation",
      description: "Affects the next confirmation alert. This command will \
                    cancel it. If the alert is already present, then use \
                    \"webdriver choose cancel on visible confirmation\" instead."
    }],
    [ "chooseCancelOnNextPrompt", {
      name: "choose cancel on next prompt",
      description: "Affects the next alert prompt. This command will cancel \
                    it. If the alert is already present, then use \"webdriver \
                    choose cancel on visible prompt\" instead."
    }],
    [ "chooseOkOnNextConfirmation", {
      name: "choose ok on next confirmation",
      description: "Affects the next confirmation alert. This command will accept \
                    it. If the alert is already present, then use \"webdriver \
                    choose ok on visible confirmation\" instead."
    }],
    [ "click", {
      name: "click",
      type: TargetTypes.LOCATOR,
      description: "Clicks on a target element (e.g., a link, button, checkbox, or radio button).",
      target: ArgTypes.locator
    }],
    [ "clickAt", {
      name: "click at",
      type: TargetTypes.LOCATOR,
      description: "Clicks on a target element (e.g., a link, button, checkbox, \
                    or radio button). The coordinates are relative to the target \
                    element (e.g., 0,0 is the top left corner of the element) \
                    and are mostly used to check effects that relay on them, \
                    for example the material ripple effect.",
      target: ArgTypes.locator,
      value: ArgTypes.coord
    }],
    [ "check", {
      name: "check",
      type: TargetTypes.LOCATOR,
      description: "Check a toggle-button (checkbox/radio).",
      target: ArgTypes.locator
    }],
    [ "do", {
      name: "do",
      description: "Create a loop that executes the proceeding commands at \
                    least once. Terminate the branch with the repeat if command."
    }],
    [ "doubleClick", {
      name: "double click",
      type: TargetTypes.LOCATOR,
      description: "Double clicks on an element (e.g., a link, button, checkbox, or radio button).",
      target: ArgTypes.locator
    }],
    [ "doubleClickAt", {
      name: "double click at",
      type: TargetTypes.LOCATOR,
      description: "Double clicks on a target element (e.g., a link, button, \
                    checkbox, or radio button). The coordinates are relative \
                    to the target element (e.g., 0,0 is the top left corner \
                    of the element) and are mostly used to check effects that \
                    relay on them, for example the material ripple effect.",
      target: ArgTypes.locator,
      value: ArgTypes.coord
    }],
    [ "dragAndDropToObject", {
      name: "drag and drop to object",
      type: TargetTypes.LOCATOR,
      description: "Drags an element and drops it on another element.",
      target: ArgTypes.locatorOfObjectToBeDragged,
      value: ArgTypes.locatorOfDragDestinationObject
    }],
    [ "echo", {
      name: "echo",
      description: "Prints the specified message into the third table cell in your Selenese tables.\
                    Useful for debugging.",
      target: ArgTypes.message
    }],
    [ "else", {
      name: "else",
      description: "Part of an if block. Execute the commands in this branch \
                    when an if and/or else if condition are not met. Terminate \
                    the branch with the end command."
    }],
    [ "elseIf", {
      name: "else if",
      description: "Part of an if block. Execute the commands in this branch \
                    when an if condition has not been met. Terminate the branch \
                    with the end command.",
      target: ArgTypes.conditionalExpression
    }],
    [ "end", {
      name: "end",
      description: "Terminates a control flow block for if, while, and times."
    }],
    [ "executeScript", {
      name: "execute script",
      description: "Executes a snippet of JavaScript in the context of the currently selected frame or \
                    window. The script fragment will be executed as the body of an anonymous function. \
                    To store the return value, use the 'return' keyword and provide a variable name in \
                    the value input field.",
      target: ArgTypes.script,
      value: ArgTypes.variableName
    }],
    [ "executeAsyncScript", {
      name: "execute async script",
      description: "Executes an async snippet of JavaScript in the context of the currently selected frame or \
                    window. The script fragment will be executed as the body of an anonymous function and must \
                    return a Promise. The Promise result will be saved on the variable if you use the 'return' \
                    keyword.",
      target: ArgTypes.script,
      value: ArgTypes.variableName
    }],
    [ "editContent", {
      name: "edit content",
      type: TargetTypes.LOCATOR,
      description: "Sets the value of a content editable element as if you typed in it.",
      target: ArgTypes.locator,
      value: ArgTypes.value
    }],
    [ "if", {
      name: "if",
      type: TargetTypes.LOCATOR,
      description: "Create a conditional branch in your test. Terminate the branch with the end command.",
      target: ArgTypes.conditionalExpression
    }],
    [ "mouseDownAt", {
      name: "mouse down at",
      type: TargetTypes.LOCATOR,
      description: "Simulates a user pressing the left mouse button (without releasing it yet) \
                    at the specified location.",
      target: ArgTypes.locator,
      value: ArgTypes.coord
    }],
    [ "mouseMoveAt", {
      name: "mouse move at",
      type: TargetTypes.LOCATOR,
      description: "Simulates a user pressing the mouse button (without releasing it yet) \
                    on the specified element.",
      target: ArgTypes.locator,
      value: ArgTypes.coord
    }],
    [ "mouseOut", {
      name: "mouse out",
      type: TargetTypes.LOCATOR,
      description: "Simulates a user moving the mouse pointer away from the specified element.",
      target: ArgTypes.locator
    }],
    [ "mouseOver", {
      name: "mouse over",
      type: TargetTypes.LOCATOR,
      description: "Simulates a user hovering a mouse over the specified element.",
      target: ArgTypes.locator
    }],
    [ "mouseUpAt", {
      name: "mouse up at",
      type: TargetTypes.LOCATOR,
      description: "Simulates the event that occurs when the user releases the mouse button \
                    (e.g., stops holding the button down) at the specified location.",
      target: ArgTypes.locator,
      value: ArgTypes.coord
    }],
    [ "open", {
      name: "open",
      description: "Opens a URL and waits for the page to load before proceeding. \
                    This accepts both relative and absolute URLs.",
      target: ArgTypes.url
    }],
    [ "pause", {
      name: "pause",
      description: "Wait for the specified amount of time.",
      target: ArgTypes.waitTime
    }],
    [ "removeSelection", {
      name: "remove selection",
      type: TargetTypes.LOCATOR,
      description: "Remove a selection from the set of selected options in a multi-select \
                    element using an option locator.",
      target: ArgTypes.locator,
      value: ArgTypes.optionLocator
    }],
    [ "repeatIf", {
      name: "repeat if",
      description: "Terminate a 'do' control flow branch conditionally. If the result of the \
                    provided conditional expression is true, it starts the do loop over. \
                    Otherwise it ends the loop.",
      target: ArgTypes.conditionalExpression
    }],
    [ "run", {
      name: "run",
      description: "Runs a test case from the current project.",
      target: ArgTypes.testCase
    }],
    [ "runScript", {
      name: "run script",
      description: "Creates a new \"script\" tag in the body of the current test \
                    window, and adds the specified text into the body of the \
                    command. Beware that JS exceptions thrown in these script \
                    tags aren't managed by Selenium, so you should probably wrap \
                    your script in try/catch blocks if there is any chance that the \
                    script will throw an exception.",
      target: ArgTypes.script
    }],
    [ "select", {
      name: "select",
      type: TargetTypes.LOCATOR,
      description: "Select an element from a drop-down menu using an option locator. \
                    Option locators provide different ways of specifying a select \
                    element (e.g., label=, value=, id=, index=). If no option \
                    locator prefix is provided, a match on the label will be attempted.",
      target: ArgTypes.selectLocator,
      value: ArgTypes.optionLocator
    }],
    [ "selectFrame", {
      name: "select frame",
      type: TargetTypes.LOCATOR,
      description: "Selects a frame within the current window. You may invoke \
                    this command multiple times to select a nested frame. NOTE: \
                    To select the parent frame, use \"relative=parent\" as a \
                    locator. To select the top frame, use \"relative=top\". \
                    You can also select a frame by its 0-based index number \
                    (e.g., select the first frame with \"index=0\", or the \
                    third frame with \"index=2\").",
      target: ArgTypes.locator
    }],
    [ "selectWindow", {
      name: "select window",
      description: "Selects a popup window using a window locator. Once a popup \
                    window has been selected, all commands will go to that window. \
                    To select the main window again, use null as the target. \
                    Window locators provide different ways of specifying the window \
                    object: by title or by generated id.",
      target: ArgTypes.window
    }],
    [ "sendKeys", {
      name: "send keys",
      type: TargetTypes.LOCATOR,
      description: "Simulates keystroke events on the specified element, \
                    as though you typed the value key-by-key. This simulates \
                    a real user typing every character in the specified string; \
                    it is also bound by the limitations of a real user, like not \
                    being able to type into a invisible or read only elements. \
                    This is useful for dynamic UI widgets (like auto-completing \
                    combo boxes) that require explicit key events. Unlike the \
                    simple \"type\" command, which forces the specified value \
                    into the page directly, this command will not replace the \
                    existing content.",
      target: ArgTypes.locator,
      value: ArgTypes.keySequence
    }],
    [ "setSpeed", {
      name: "set speed",
      description: "Set execution speed (e.g., set the millisecond length of a \
                    delay which will follow each Selenium operation). By default, \
                    there is no such delay, e.g., the delay is 0 milliseconds. \
                    This setting is global, and will affect all test runs, until changed.",
      target: ArgTypes.waitTime
    }],
    [ "setWindowSize", {
      name: "set window size",
      description: "Set the browser's window size, including the browser's interface.",
      target: ArgTypes.resolution
    }],
    [ "store", {
      name: "store",
      description: "Save a target string as a variable for easy re-use.",
      target: ArgTypes.text,
      value: ArgTypes.variableName
    }],
    [ "storeAttribute", {
      name: "store attribute",
      description: "Gets the value of an element attribute. \
                    The value of the attribute may differ across browsers \
                    (this is the case for the \"style\" attribute, for example).",
      target: ArgTypes.attributeLocator,
      value: ArgTypes.variableName
    }],
    [ "storeText", {
      name: "store text",
      type: TargetTypes.LOCATOR,
      description: "Gets the text of an element and stores it for later use. \
                    This works for any element that contains text.",
      target: ArgTypes.locator,
      value: ArgTypes.variableName
    }],
    [ "storeValue", {
      name: "store value",
      type: TargetTypes.LOCATOR,
      description: "Gets the value of element and stores it for later use. \
                    This works for any input type element.",
      target: ArgTypes.locator,
      value: ArgTypes.variableName
    }],
    [ "storeTitle", {
      name: "store title",
      description: "Gets the title of the current page."
    }],
    [ "storeXpathCount", {
      name: "store xpath count",
      description: "Gets the number of nodes that match the specified xpath, \
                    eg. \"//table\" would give the number of tables.",
      target: ArgTypes.xpath,
      value: ArgTypes.variableName
    }],
    [ "submit", {
      name: "submit",
      type: TargetTypes.LOCATOR,
      description: "Submit the specified form. This is particularly useful \
                    for forms without submit buttons, e.g. single-input \"Search\" forms.",
      target: ArgTypes.formLocator
    }],
    [ "times", {
      name: "times",
      description: "Create a loop that executes the proceeding commands n number of times.",
      target: ArgTypes.times
    }],
    [ "type", {
      name: "type",
      type: TargetTypes.LOCATOR,
      description: "Sets the value of an input field, as though you typed it in. \
                    Can also be used to set the value of combo boxes, check boxes, \
                    etc. In these cases, value should be the value of the option \
                    selected, not the visible text. \
                    Chrome only: If a file path is given it will be uploaded to \
                    the input (for type=file), NOTE: XPath locators are not supported.",
      target: ArgTypes.locator,
      value: ArgTypes.value
    }],
    [ "uncheck", {
      name: "uncheck",
      type: TargetTypes.LOCATOR,
      description: "Uncheck a toggle-button (checkbox/radio).",
      target: ArgTypes.locator
    }],
    [ "verify", {
      name: "verify",
      description: "Soft assert that a variable is an expected value. The variable's value will be converted to a string for comparison.",
      target: ArgTypes.variableName,
      value: ArgTypes.expectedValue
    }],
    [ "verifyChecked", {
      name: "verify checked",
      type: TargetTypes.LOCATOR,
      description: "Soft assert that a toggle-button (checkbox/radio) has been checked.",
      target: ArgTypes.locator
    }],
    [ "verifyNotChecked", {
      name: "verify not checked",
      type: TargetTypes.LOCATOR,
      description: "Soft assert that a toggle-button (checkbox/radio) has not been checked.",
      target: ArgTypes.locator
    }],
    [ "verifyEditable", {
      name: "verify editable",
      type: TargetTypes.LOCATOR,
      description: "Soft assert whether the specified input element is \
                    editable (e.g., hasn't been disabled).",
      target: ArgTypes.locator
    }],
    [ "verifyNotEditable", {
      name: "verify not editable",
      type: TargetTypes.LOCATOR,
      description: "Soft assert whether the specified input element \
                    is not editable (e.g., hasn't been disabled).",
      target: ArgTypes.locator
    }],
    [ "verifyElementPresent", {
      name: "verify element present",
      type: TargetTypes.LOCATOR,
      description: "Soft assert that the specified element is somewhere on the page.",
      target: ArgTypes.locator
    }],
    [ "verifyElementNotPresent", {
      name: "verify element not present",
      type: TargetTypes.LOCATOR,
      description: "Soft assert that the specified element is not somewhere on the page.",
      target: ArgTypes.locator
    }],
    [ "verifySelectedValue", {
      name: "verify selected value",
      type: TargetTypes.LOCATOR,
      description: "Soft assert that the expected element has been chosen in a \
                    select menu by its option attribute.",
      target: ArgTypes.selectLocator,
      value: ArgTypes.option
    }],
    [ "verifyNotSelectedValue", {
      name: "verify not selected value",
      description: "Soft assert that the expected element has not been chosen in a \
                    select menu by its option attribute.",
      target: ArgTypes.selectLocator,
      value: ArgTypes.option
    }],
    [ "verifyText", {
      name: "verify text",
      type: TargetTypes.LOCATOR,
      description: "Soft assert the text of an element is present.",
      target: ArgTypes.locator,
      value: ArgTypes.text
    }],
    [ "verifyNotText", {
      name: "verify not text",
      type: TargetTypes.LOCATOR,
      description: "Soft assert the text of an element is not present.",
      target: ArgTypes.locator,
      value: ArgTypes.text
    }],
    [ "verifyTitle", {
      name: "verify title",
      description: "Soft assert the title of the current page contains the provided text.",
      target: ArgTypes.text
    }],
    [ "verifyValue", {
      name: "verify value",
      type: TargetTypes.LOCATOR,
      description: "Soft assert the (whitespace-trimmed) value of an input field \
                    (or anything else with a value parameter). For checkbox/radio \
                    elements, the value will be \"on\" or \"off\" depending on \
                    whether the element is checked or not.",
      target: ArgTypes.locator,
      value: ArgTypes.pattern
    }],
    [ "verifySelectedLabel", {
      name: "verify selected label",
      type: TargetTypes.LOCATOR,
      description: "Soft assert the visible text for a selected option \
                    in the specified select element.",
      target: ArgTypes.selectLocator,
      value: ArgTypes.pattern
    }],
    [ "waitForElementEditable", {
      name: "wait for element editable",
      type: TargetTypes.LOCATOR,
      description: "Wait for an element to be editable.",
      target: ArgTypes.locator,
      value: ArgTypes.waitTime
    }],
    [ "waitForElementNotEditable", {
      name: "wait for element not editable",
      type: TargetTypes.LOCATOR,
      description: "Wait for an element to not be editable.",
      target: ArgTypes.locator,
      value: ArgTypes.waitTime
    }],
    [ "waitForElementPresent", {
      name: "wait for element present",
      type: TargetTypes.LOCATOR,
      description: "Wait for a target element to be present on the page.",
      target: ArgTypes.locator,
      value: ArgTypes.waitTime
    }],
    [ "waitForElementNotPresent", {
      name: "wait for element not present",
      type: TargetTypes.LOCATOR,
      description: "Wait for a target element to not be present on the page.",
      target: ArgTypes.locator,
      value: ArgTypes.waitTime
    }],
    [ "waitForElementVisible", {
      name: "wait for element visible",
      type: TargetTypes.LOCATOR,
      description: "Wait for a target element to be visible on the page.",
      target: ArgTypes.locator,
      value: ArgTypes.waitTime
    }],
    [ "waitForElementNotVisible", {
      name: "wait for element not visible",
      type: TargetTypes.LOCATOR,
      description: "Wait for a target element to not be visible on the page.",
      target: ArgTypes.locator,
      value: ArgTypes.waitTime
    }],
    [ "webdriverAnswerOnVisiblePrompt", {
      name: "webdriver answer on visible prompt",
      description: "Affects a currently showing alert prompt. This command \
                    instructs Selenium to provide the specified answer to it. \
                    If the alert has not appeared yet then use \"answer on next \
                    prompt\" instead.",
      target: ArgTypes.answer
    }],
    [ "webdriverChooseCancelOnVisibleConfirmation", {
      name: "webdriver choose cancel on visible confirmation",
      description: "Affects a currently showing confirmation alert. This command \
                    instructs Selenium to cancel it. If the alert has not \
                    appeared yet then use \"choose cancel on next confirmation\" \
                    instead."
    }],
    [ "webdriverChooseCancelOnVisiblePrompt", {
      name: "webdriver choose cancel on visible prompt",
      description: "Affects a currently showing alert prompt. This command \
                    instructs Selenium to cancel it. If the alert has not \
                    appeared yet then use \"choose cancel on next prompt\" \
                    instead."
    }],
    [ "webdriverChooseOkOnVisibleConfirmation", {
      name: "webdriver choose ok on visible confirmation",
      description: "Affects a currently showing confirmation alert. This command \
                    instructs Selenium to accept it. If the alert has not \
                    appeared yet then use \"choose ok on next confirmation\" \
                    instead."
    }],
    [ "while", {
      name: "while",
      description: "Create a loop that executes the proceeding commands repeatedly \
                    for as long as the provided conditional expression is true.",
      target: ArgTypes.conditionalExpression
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

export const ControlFlowCommandNames = {
  do: "do",
  else: "else",
  elseIf: "elseIf",
  end: "end",
  if: "if",
  repeatIf: "repeatIf",
  times: "times",
  while: "while"
};

function commandNamesEqual(command, target) {
  if (command) {
    return (command.command === target);
  } else {
    return false;
  }
}

function isBlockOpen(command) {
  return (isIf(command) || isLoop(command));
}

function isConditional(command) {
  switch(command.command) {
    case ControlFlowCommandNames.elseIf:
    case ControlFlowCommandNames.if:
    case ControlFlowCommandNames.repeatIf:
    case ControlFlowCommandNames.times:
    case ControlFlowCommandNames.while:
      return true;
    default:
      return false;
  }
}

function isControlFlow(command) {
  switch(command.command) {
    case ControlFlowCommandNames.if:
    case ControlFlowCommandNames.elseIf:
    case ControlFlowCommandNames.else:
    case ControlFlowCommandNames.end:
    case ControlFlowCommandNames.do:
    case ControlFlowCommandNames.repeatIf:
    case ControlFlowCommandNames.times:
    case ControlFlowCommandNames.while:
      return true;
    default:
      return false;
  }
}

function isDo(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.do);
}

function isElse(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.else);
}

function isElseIf(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.elseIf);
}

function isElseOrElseIf(command) {
  return (isElseIf(command) || isElse(command));
}

function isEnd(command) {
  return (commandNamesEqual(command, ControlFlowCommandNames.end));
}

function isIf(command) {
  return (commandNamesEqual(command, ControlFlowCommandNames.if));
}

function isIfBlock(command) {
  return (isIf(command) || isElseOrElseIf(command));
}

function isLoop(command) {
  return (commandNamesEqual(command, ControlFlowCommandNames.while) ||
          commandNamesEqual(command, ControlFlowCommandNames.times) ||
          commandNamesEqual(command, ControlFlowCommandNames.repeatIf));
}

function isTerminal(command) {
  return (isElse(command) ||
          isDo(command) ||
          isEnd(command));
}

function isTimes(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.times);
}

export const ControlFlowCommandChecks = {
  isIfBlock: isIfBlock,
  isConditional: isConditional,
  isDo: isDo,
  isElse: isElse,
  isElseOrElseIf: isElseOrElseIf,
  isEnd: isEnd,
  isIf: isIf,
  isLoop: isLoop,
  isBlockOpen: isBlockOpen,
  isTerminal: isTerminal,
  isControlFlow: isControlFlow,
  isTimes: isTimes
};

