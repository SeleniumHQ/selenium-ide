/* eslint-disable */
import Command, { Commands } from "../../models/Command";

describe("Command", () => {
  it("should set a command", () => {
    const command = new Command();
    command.setCommand(Commands.open);
    expect(command.command).toBe(Commands.open);
  });
  it("should throw if the command is now part of the enum", () => {
    const command = new Command();
    expect(() => { command.setCommand("throw"); }).toThrowError("Invalid Command Type was given");
  });
  it("should set the target", () => {
    const command = new Command();
    command.setTarget("a");
    expect(command.target).toBe("a");
  });
  it("should set the value", () => {
    const command = new Command();
    command.setValue("123456");
    expect(command.value).toBe("123456");
  });
});

describe("Commands enum", () => {
  it("should contains only strings as values", () => {
    Object.keys(Commands).forEach(command => {
      expect(Commands[command].constructor.name).toBe("String");
    });
  });
});
