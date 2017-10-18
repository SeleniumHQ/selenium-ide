/* eslint-disable */
import { useStrict, observe } from "mobx";
import ProjectStore from "../../stores/domain/ProjectStore";
import Suite from "../../models/Suite";
import TestCase from "../../models/TestCase";

useStrict(true);

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
  it("Suites should have randomly generated identifiers", () => {
    expect((new Suite()).id).not.toBe((new Suite()).id);
  });
  it("should observe when a new Test Case is added", () => {
    const suite = new Suite();
    const disposer = observe(suite, "tests", (change) => {
      expect(change.newValue.length).toBe(1);
    });
    suite.tests.push(new TestCase());
  });
  it("should add a new Test Case", () => {
    const store = new ProjectStore();
    const suite = new Suite();
    const test = new TestCase();
    store.addTestCase(test);
    expect(suite.tests.length).toBe(0);
    suite.addTestCase(test);
    expect(suite.tests.length).toBe(1);
  });
  it("should throw if no Test Case was given", () => {
    const suite = new Suite();
    expect(() => suite.addTestCase()).toThrowError("Expected to receive TestCase instead received undefined");
  });
  it("should throw if a different type was given", () => {
    const suite = new Suite();
    expect(() => suite.addTestCase(1)).toThrowError("Expected to receive TestCase instead received Number");
  });
  it("should remove a Test Case from the suite", () => {
    const store = new ProjectStore();
    const suite = new Suite();
    const test = new TestCase();
    store.addTestCase(test);
    suite.addTestCase(test);
    expect(suite.tests.length).toBe(1);
    suite.removeTestCase(test);
    expect(suite.tests.length).toBe(0);
  });
  it("should do nothing if removed a non-existent test", () => {
    const store = new ProjectStore();
    const suite = new Suite();
    const test = new TestCase();
    store.addTestCase(test);
    suite.addTestCase(test);
    expect(suite.tests.length).toBe(1);
    suite.removeTestCase(new TestCase());
    expect(suite.tests.length).toBe(1);
  });
});
