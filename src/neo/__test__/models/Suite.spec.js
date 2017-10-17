/* eslint-disable */
import { observe } from "mobx";
import ProjectStore from "../../stores/domain/ProjectStore";
import Suite from "../../models/Suite";
import Test from "../../models/Test";

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
  it("should observe when a new Test is added", () => {
    const suite = new Suite();
    const disposer = observe(suite, "tests", (change) => {
      expect(change.newValue.length).toBe(1);
    });
    suite.tests.push(new Test());
  });
  it("should add a new Test", () => {
    const store = new ProjectStore();
    const suite = new Suite();
    const test = new Test();
    store.addTest(test);
    expect(suite.tests.length).toBe(0);
    suite.addTest(test);
    expect(suite.tests.length).toBe(1);
  });
  it("should throw if no Test was given", () => {
    const suite = new Suite();
    expect(() => suite.addTest()).toThrowError("Expected to receive Test instead received undefined");
  });
  it("should throw if a different type was given", () => {
    const suite = new Suite();
    expect(() => suite.addTest(1)).toThrowError("Expected to receive Test instead received Number");
  });
  it("should remove a Test", () => {
    const store = new ProjectStore();
    const suite = new Suite();
    const test = new Test();
    store.addTest(test);
    suite.addTest(test);
    expect(suite.tests.length).toBe(1);
    suite.removeTest(test);
    expect(suite.tests.length).toBe(0);
  });
  it("should do nothing if removed a non-existent test", () => {
    const store = new ProjectStore();
    const suite = new Suite();
    const test = new Test();
    store.addTest(test)
    suite.addTest(test);
    expect(suite.tests.length).toBe(1);
    suite.removeTest(new Test());
    expect(suite.tests.length).toBe(1);
  });
  it("should throw if a different type was given", () => {
    const suite = new Suite();
    expect(() => suite.removeTest(1)).toThrowError("Expected to receive Test instead received Number");
  });
});
