/* eslint-disable */
import { observe } from "mobx";
import ProjectStore from "../../../stores/domain/ProjectStore";
import Suite from "../../../models/Suite";
import Test from "../../../models/Test";

describe("Project Store", () => {
  it("should have a name", () => {
    const store = new ProjectStore("myStore");
    expect(store.name).toBe("myStore");
  });
  it("should observe the name change", () => {
    const store = new ProjectStore("myStore");
    const disposer = observe(store, "name", (change) => {
      expect(change.newValue).toBe("changed");
    });
    store.name = "changed";
    disposer();
  });
  it("should observe adding addition test to the store", () => {
    const store = new ProjectStore();
    const disposer = observe(store, "tests", (change) => {
      expect(change.newValue.length).toBe(1);
    });
    store.tests.push(new Test());
    disposer();
  });
  it("should add a new Test", () => {
    const store = new ProjectStore();
    expect(store.tests.length).toBe(0);
    store.addTest(new Test());
    expect(store.tests.length).toBe(1);
  });
  it("should throw if no Test was given", () => {
    const store = new ProjectStore();
    expect(() => store.addTest()).toThrowError("Expected to receive Test instead received undefined");
  });
  it("should throw if a different type was given", () => {
    const store = new ProjectStore();
    expect(() => store.addTest(1)).toThrowError("Expected to receive Test instead received Number");
  });
  it("should delete a test", () => {
    const store = new ProjectStore();
    const test = new Test();
    store.addTest(test);
    expect(store.tests.length).toBe(1);
    store.deleteTest(test);
    expect(store.tests.length).toBe(0);
  });
  it("should create a test", () => {
    const store = new ProjectStore();
    expect(store.tests.length).toBe(0);
    store.createTest();
    expect(store.tests.length).toBe(1);
  });
  it("should pass ctor args to test when created", () => {
    const store = new ProjectStore();
    const test = store.createTest("my test");
    expect(test.name).toBe("my test");
  });
  it("should create a suite", () => {
    const store = new ProjectStore();
    expect(store.suites.length).toBe(0);
    store.createSuite();
    expect(store.suites.length).toBe(1);
  });
  it("should pass ctor args to suite when created", () => {
    const store = new ProjectStore();
    const suite = store.createSuite("my suite");
    expect(suite.name).toBe("my suite");
  });
  it("should remove the deleted test from it's suites", () => {
    const store = new ProjectStore();
    const firstSuite = new Suite(store);
    const secondSuite = new Suite(store);
    const controlSuite = new Suite(store);
    const toBeDeleted = new Test();
    const control = new Test();
    store.addTest(toBeDeleted);
    store.addTest(control);
    firstSuite.addTest(toBeDeleted);
    secondSuite.addTest(toBeDeleted);
    secondSuite.addTest(control);
    controlSuite.addTest(control);
    expect(firstSuite.tests.length).toBe(1);
    expect(secondSuite.tests.length).toBe(2);
    expect(controlSuite.tests.length).toBe(1);
    store.deleteTest(toBeDeleted);
    expect(firstSuite.tests.length).toBe(0);
    expect(secondSuite.tests.length).toBe(1);
    expect(controlSuite.tests.length).toBe(1);
  });
});
