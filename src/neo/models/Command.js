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

export const Commands = Object.freeze({
  open: "open"
});

const CommandsArray = Object.keys(Commands).map(k => (Commands[k]));
