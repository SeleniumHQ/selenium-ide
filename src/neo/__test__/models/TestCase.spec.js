/* eslint-disable */
import { useStrict, observe } from "mobx";
import TestCase from "../../models/TestCase";
import Command from "../../models/Command";

useStrict(true);

describe("TestCase model", () => {
  it("new test should be named 'Untitled Test'", () => {
    expect((new TestCase()).name).toBe("Untitled Test");
  });
  it("should observe name changes", () => {
    const test = new TestCase();
    const disposer = observe(test, "name", (change) => {
      expect(change.newValue).toBe("changed");
    });
    test.name = "changed";
    disposer();
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
  it("should throw if the given command is undefined", () => {
    const test = new TestCase();
    expect(() => test.inserCommandAt()).toThrowError("Expected to receive Command instead received undefined");
  });
  it("should throw if the given command is different type", () => {
    const test = new TestCase();
    expect(() => test.inserCommandAt(5)).toThrowError("Expected to receive Command instead received Number");
  });
  it("should throw if the given index is undefined", () => {
    const test = new TestCase();
    const command = new Command();
    expect(() => test.inserCommandAt(command)).toThrowError("Expected to receive Number instead received undefined");
  });
  it("should throw if the given command is different type", () => {
    const test = new TestCase();
    const command = new Command();
    expect(() => test.inserCommandAt(command, "5")).toThrowError("Expected to receive Number instead received String");
  });
  it("should insert the command in the middle", () => {
    const test = new TestCase();
    test.createCommand();
    test.createCommand();
    const command = new Command();
    test.insertCommandAt(command, 1);
    expect(test.commands[1]).toBe(command);
  });
  it("Should remove a command", () => {
    const test = new TestCase();
    const command = test.createCommand();
    expect(test.commands.length).toBe(1);
    test.removeCommand(command);
    expect(test.commands.length).toBe(0);
  });
});
