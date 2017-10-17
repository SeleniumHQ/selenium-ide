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
});
