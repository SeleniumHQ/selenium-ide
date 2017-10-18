/* eslint-disable */
import { useStrict, observe } from "mobx";
import TestCase from "../../models/TestCase";

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
  it("Should remove a command", () => {
    const test = new TestCase();
    const command = test.createCommand();
    expect(test.commands.length).toBe(1);
    test.removeCommand(command);
    expect(test.commands.length).toBe(0);
  });
});
