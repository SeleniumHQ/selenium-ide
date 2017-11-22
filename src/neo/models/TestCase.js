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
  }

  @action.bound setName(name) {
    this.name = name;
  }

  @action.bound createCommand(index) {
    if (index !== undefined && index.constructor.name !== "Number") {
      throw new Error(`Expected to receive Number instead received ${index !== undefined ? index.constructor.name : index}`);
    } else {
      const command = new Command();
      index !== undefined ? this.commands.splice(index, 0, command) : this.commands.push(command);
      return command;
    }
  }

  @action.bound addCommand(command) {
    if (!command || command.constructor.name !== "Command") {
      throw new Error(`Expected to receive Command instead received ${command ? command.constructor.name : command}`);
    } else {
      this.commands.push(command);
    }
  }

  @action.bound insertCommandAt(command, index) {
    if (!command || command.constructor.name !== "Command") {
      throw new Error(`Expected to receive Command instead received ${command ? command.constructor.name : command}`);
    } else if (index === undefined || index.constructor.name !== "Number") {
      throw new Error(`Expected to receive Number instead received ${index !== undefined ? index.constructor.name : index}`);
    } else {
      this.commands.splice(index, 0, command);
    }
  }

  @action.bound swapCommands(from, to) {
    const command = this.commands.splice(from, 1)[0];
    this.insertCommandAt(command, to);
  }

  @action.bound removeCommand(command) {
    this.commands.remove(command);
  }

  @action.bound clearAllCommands() {
    this.commands.clear();
  }

  @action
  static fromJS = function(jsRep) {
    const test = new TestCase(jsRep.id);
    test.setName(jsRep.name);
    test.commands.replace(jsRep.commands.map(Command.fromJS));

    return test;
  };
}
