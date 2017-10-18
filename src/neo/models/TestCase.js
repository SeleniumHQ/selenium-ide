import { action, observable } from "mobx";
import uuidv4 from "uuid/v4";
import Command from "./Command";

export default class TestCase {
  id = null;
  @observable name = null;
  @observable commands = [];

  constructor(id = uuidv4(), name = "Untitled Test") {
    this.id = id;
    this.name = name;
    this.createCommand = this.createCommand.bind(this);
    this.removeCommand = this.removeCommand.bind(this);
  }

  @action createCommand() {
    const command = new Command();
    this.commands.push(command);
    return command;
  }

  @action removeCommand(command) {
    this.commands.remove(command);
  }
}
