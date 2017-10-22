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
    this.insertCommandAt = this.insertCommandAt.bind(this);
    this.swapCommands = this.swapCommands.bind(this);
  }

  @action createCommand() {
    const command = new Command();
    this.commands.push(command);
    return command;
  }

  @action insertCommandAt(command, index) {
    if (!command || command.constructor.name !== "Command") {
      throw new Error(`Expected to receive Command instead received ${command ? command.constructor.name : command}`);
    } else if (index === undefined || index.constructor.name !== "Number") {
      throw new Error(`Expected to receive Number instead received ${index !== undefined ? index.constructor.name : index}`);
    } else {
      this.commands.splice(index, 0, command);
    }
  }

  @action swapCommands(from, to) {
    const command = this.commands.splice(from, 1)[0];
    this.insertCommandAt(command, to);
  }

  @action removeCommand(command) {
    this.commands.remove(command);
  }
}
