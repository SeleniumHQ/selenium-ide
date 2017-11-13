/* eslint-disable */
import Command, { Commands, CommandsValues } from "../../models/Command";

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
  it("should initialize the primitives with empty strings", () => {
    const command = new Command();
    expect(command.command).toBe("");
    expect(command.target).toBe("");
    expect(command.value).toBe("");
  });
  it("shouls clone itself, creating a new id", () => {
    const command = new Command();
    command.setCommand("open");
    command.setTarget("a");
    command.setValue("submit");
    const clone = command.clone();
    expect(clone).not.toBe(command);
    expect(clone.id).not.toBe(command.id);
    expect(clone.command).toBe(command.command);
    expect(clone.target).toBe(command.target);
    expect(clone.value).toBe(command.value);
  });

  it("should load from JS", () => {
    const jsRepresentation = {
      id: "1",
      command: "open",
      target: "/",
      value: "test"
    };
    const command = Command.fromJS(jsRepresentation);
    expect(command.id).toBe(jsRepresentation.id);
    expect(command.command).toBe(jsRepresentation.command);
    expect(command.target).toBe(jsRepresentation.target);
    expect(command.value).toBe(jsRepresentation.value);
    expect(command instanceof Command).toBeTruthy();
  });
});

describe("Commands enum", () => {
  it("should contains only strings as values", () => {
    Object.keys(Commands).forEach(command => {
      expect(Commands[command].constructor.name).toBe("String");
    });
  });
  it("it should traverse through the reverse dictionary", () => {
    expect(Commands[0]).toBe(Commands[CommandsValues[Commands[0]]]);
  });
});
