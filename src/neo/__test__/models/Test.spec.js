/* eslint-disable */
import { observe } from "mobx";
import Test from "../../models/Test";

describe("Test model", () => {
  it("new test should be named 'Untitled Test'", () => {
    expect((new Test()).name).toBe("Untitled Test");
  });
  it("should observe name changes", () => {
    const test = new Test();
    const disposer = observe(test, "name", (change) => {
      expect(change.newValue).toBe("changed");
    });
    test.name = "changed";
    disposer();
  });
  it("Tests should have randomly generated identifiers", () => {
    expect((new Test()).id).not.toBe((new Test()).id);
  });
});
