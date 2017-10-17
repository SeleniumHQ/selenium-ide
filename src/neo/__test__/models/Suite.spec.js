/* eslint-disable */
import { observe } from "mobx";
import Suite from "../../models/Suite";

describe("Suite model", () => {
  it("new suite should be named 'Utitled Suite'", () => {
    expect((new Suite()).name).toBe("Untitled Suite");
  });
  it("should observe name changes", () => {
    const suite = new Suite();
    const disposer = observe(suite, "name", (change) => {
      expect(change.newValue).toBe("changed");
    });
    suite.name = "changed";
    disposer();
  });
  it("Tests should have randomly generated identifiers", () => {
    expect((new Suite()).id).not.toBe((new Suite()).id);
  });
});
