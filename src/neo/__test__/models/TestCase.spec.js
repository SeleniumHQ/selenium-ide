/* eslint-disable */
import { useStrict, observe } from "mobx";
import TestCase from "../../models/TestCase";
import Command from "../../models/Command";

useStrict(true);

describe("TestCase model", () => {
  it("new test should be named 'Untitled Test'", () => {
    expect((new TestCase()).name).toBe("Untitled Test");
  });
  it("should change name", () => {
    const test = new TestCase();
    test.setName("test");
    expect(test.name).toBe("test");
  });
  it("Test Cases should have randomly generated identifiers", () => {
    expect((new TestCase()).id).not.toBe((new TestCase()).id);
  });
  it("Should have array of commands", () => {
    expect((new TestCase()).commands).toBeDefined();
  });
  it("Should create a command", () => {
    const test = new TestCase();
    expect(test.commands.length).toBe(0);
    test.createCommand();
    expect(test.commands.length).toBe(1);
  });
  it("should create a command at the desired index", () => {
    const test = new TestCase();
    test.createCommand();
    const control = test.commands[0];
    test.createCommand(0);
    expect(test.commands[0]).not.toBe(control);
    expect(test.commands[1]).toBe(control);
  });
  it("should throw if the given index is not a number", () => {
    const test = new TestCase();
    expect(() => test.createCommand("2")).toThrowError("Expected to receive Number instead received String");
  });
  it("should throw if the given command is undefined", () => {
    const test = new TestCase();
    expect(() => test.insertCommandAt()).toThrowError("Expected to receive Command instead received undefined");
  });
  it("should throw if the given command is different type", () => {
    const test = new TestCase();
    expect(() => test.insertCommandAt(5)).toThrowError("Expected to receive Command instead received Number");
  });
  it("should throw if the given index is undefined", () => {
    const test = new TestCase();
    const command = new Command();
    expect(() => test.insertCommandAt(command)).toThrowError("Expected to receive Number instead received undefined");
  });
  it("should throw if the given index is different type", () => {
    const test = new TestCase();
    const command = new Command();
    expect(() => test.insertCommandAt(command, "5")).toThrowError("Expected to receive Number instead received String");
  });
  it("should insert the command in the middle", () => {
    const test = new TestCase();
    test.createCommand();
    test.createCommand();
    const command = new Command();
    test.insertCommandAt(command, 1);
    expect(test.commands[1]).toBe(command);
  });
  it("should swap the commands", () => {
    const test = new TestCase();
    test.createCommand();
    test.createCommand();
    const command1 = test.commands[0];
    const command2 = test.commands[1];
    test.swapCommands(0, 1);
    expect(command1).toBe(test.commands[1]);
    expect(command2).toBe(test.commands[0]);
  });
  it("Should remove a command", () => {
    const test = new TestCase();
    const command = test.createCommand();
    expect(test.commands.length).toBe(1);
    test.removeCommand(command);
    expect(test.commands.length).toBe(0);
  });
});
