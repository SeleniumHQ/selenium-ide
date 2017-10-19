/* eslint-disable */
import Command, { Commands } from "../../models/Command";

describe("Command", () => {
  it("should generate and id", () => {
    expect((new Command()).id).toBeDefined();
  });
  it("should set a command", () => {
    const command = new Command();
    command.setCommand(Commands.open);
    expect(command.command).toBe(Commands.open);
  });
  it("should be a valid command", () => {
    const command = new Command();
    command.setCommand("open");
    expect(command.isValid).toBeTruthy();
  });
  it("should be an invalid command", () => {
    const command = new Command();
    command.setCommand("test invalid");
    expect(command.isValid).toBeFalsy();
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
