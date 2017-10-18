import { action, observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Command {
  id = null;
  @observable command = null;
  @observable target = null;
  @observable value = null;

  constructor(id = uuidv4()) {
    this.id = id;
    this.setTarget = this.setTarget.bind(this);
    this.setTarget = this.setTarget.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  @action setCommand(command) {
    if (!CommandsArray.includes(command)) {
      throw new Error("Invalid Command Type was given");
    } else {
      this.command = command;
    }
  }

  @action setTarget(target) {
    this.target = target;
  }

  @action setValue(value) {
    this.value = value;
  }
}

export const CommandsArray = Object.freeze([
  "addSelection",
  "answerOnNextPrompt",
  "assertAlert",
  "assertConfirmation",
  "assertPrompt",
  "assertText",
  "assertTitle",
  "chooseCancelOnNextConfirmation",
  "chooseCancelOnNextPrompt",
  "chooseOkOnNextConfirmation",
  "clickAt",
  "doubleClickAt",
  "dragAndDropToObject",
  "echo",
  "editContent",
  "mouseDownAt",
  "mouseMoveAt",
  "mouseOut",
  "mouseOver",
  "mouseUpAt",
  "open",
  "pause",
  "removeSelection",
  "runScript",
  "select",
  "selectFrame",
  "selectWindow",
  "sendKeys",
  "store",
  "storeText",
  "storeTitle",
  "type",
  "verifyText",
  "verifyTitle"
]);

export const Commands = Object.freeze(CommandsArray.reduce((commands, command) => {
  commands[command] = command;
  return commands;
}, {}));
