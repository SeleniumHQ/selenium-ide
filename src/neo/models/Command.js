import { action, computed, observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Command {
  id = null;
  @observable command = "";
  @observable target = "";
  @observable value = "";

  constructor(id = uuidv4()) {
    this.id = id;
    this.setCommand = this.setCommand.bind(this);
    this.setTarget = this.setTarget.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  @action setCommand(command) {
    if (CommandsValues[command]) {
      this.command = CommandsValues[command];
    } else {
      this.command = command;
    }
  }

  @computed get isValid() {
    return CommandsArray.includes(this.command);
  }

  @action setTarget(target) {
    this.target = target;
  }

  @action setValue(value) {
    this.value = value;
  }
}

export const Commands = Object.freeze({
  addSelection: "add selection",
  answerOnNextPrompt: "answer on next prompt",
  assertAlert: "assert alert",
  assertConfirmation: "assert confirmation",
  assertPrompt: "assert prompt",
  assertText: "assert text",
  assertTitle: "assert title",
  chooseCancelOnNextConfirmation: "choose cancel on next confirmation",
  chooseCancelOnNextPrompt: "choose cancel on next prompt",
  chooseOkOnNextConfirmation: "choose ok on next confirmation",
  clickAt: "click at",
  doubleClickAt: "double click at",
  dragAndDropToObject: "drag and drop to object",
  echo: "echo",
  editContent: "edit content",
  mouseDownAt: "mouse down at",
  mouseMoveAt: "mouse move at",
  mouseOut: "mouse out",
  mouseOver: "mouse over",
  mouseUpAt: "mouse up at",
  open: "open",
  pause: "pause",
  removeSelection: "remove selection",
  runScript: "run script",
  select: "select",
  selectFrame: "select frame",
  selectWindow: "select window",
  sendKeys: "send keys",
  store: "store",
  storeText: "store text",
  storeTitle: "store title",
  type: "type",
  verifyText: "verify text",
  verifyTitle: "verify title"
});

export const CommandsArray = Object.freeze(Object.keys(Commands));

export const CommandsValues = Object.freeze(CommandsArray.reduce((commands, command) => {
  commands[Commands[command]] = command;
  return commands;
}, {}));
