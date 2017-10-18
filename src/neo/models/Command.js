import { action, observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Command {
  id = null;
  @observable command = null;
  @observable target = null;
  @observable value = null;

  constructor(id = uuidv4()) {
    this.id = id;
  }

  @action setCommand(command) {
    if (!CommandsArray.includes(command)) {
      throw new Error("Invalid Command Type was given");
    } else {
      this.command = command;
    }
  }
}

export const Commands = Object.freeze({
  open: "open"
});

const CommandsArray = Object.keys(Commands).map(k => (Commands[k]));
