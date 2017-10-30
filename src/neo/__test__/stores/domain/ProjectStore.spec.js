/* eslint-disable */
import { useStrict } from "mobx";
import ProjectStore from "../../../stores/domain/ProjectStore";
import Suite from "../../../models/Suite";
import TestCase from "../../../models/TestCase";

useStrict(true);

describe("Project Store", () => {
  it("should have a name", () => {
    const store = new ProjectStore("myStore");
    expect(store.name).toBe("myStore");
  });
  it("should set a default name", () => {
    const store = new ProjectStore();
    expect(store.name).toBe("Untitled Project");
  });
  it("should set the name", () => {
    const store = new ProjectStore("test");
    store.changeName("changed");
    expect(store.name).toBe("changed");
  });
  it("should have a base url", () => {
    const store = new ProjectStore();
    expect(store.url).toHaveProperty("url");
  });
  it("should set the url", () => {
    const store = new ProjectStore();
    const url = "http://www.seleniumhq.org/";
    store.setUrl(url);
    expect(store.url).toBe(url);
  });
  it("should add a new TestCase", () => {
    const store = new ProjectStore();
    expect(store.tests.length).toBe(0);
    store.addTestCase(new TestCase());
    expect(store.tests.length).toBe(1);
  });
  it("should throw if no TestCase was given", () => {
    const store = new ProjectStore();
    expect(() => store.addTestCase()).toThrowError("Expected to receive TestCase instead received undefined");
  });
  it("should throw if a different type was given", () => {
    const store = new ProjectStore();
    expect(() => store.addTestCase(1)).toThrowError("Expected to receive TestCase instead received Number");
  });
  it("should delete a test case", () => {
    const store = new ProjectStore();
    const test = new TestCase();
    store.addTestCase(test);
    expect(store.tests.length).toBe(1);
    store.deleteTestCase(test);
    expect(store.tests.length).toBe(0);
  });
  it("should create a test case", () => {
    const store = new ProjectStore();
    expect(store.tests.length).toBe(0);
    store.createTestCase();
    expect(store.tests.length).toBe(1);
  });
  it("should pass ctor args to test when created", () => {
    const store = new ProjectStore();
    const test = store.createTestCase("my test");
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
  it("should delete a suite", () => {
    const store = new ProjectStore();
    const control = store.createSuite("control");
    const toBeDeleted = store.createSuite("deleted");
    expect(store.suites.length).toBe(2);
    store.deleteSuite(toBeDeleted);
    expect(store.suites.length).toBe(1);
    expect(store.suites[0]).toBe(control);
  });
  it("should remove the deleted test from it's suites", () => {
    const store = new ProjectStore();
    const firstSuite = store.createSuite();
    const secondSuite = store.createSuite();
    const controlSuite = store.createSuite();
    const toBeDeleted = store.createTestCase();
    const control = store.createTestCase();
    firstSuite.addTestCase(toBeDeleted);
    secondSuite.addTestCase(toBeDeleted);
    secondSuite.addTestCase(control);
    controlSuite.addTestCase(control);
    expect(firstSuite.tests.length).toBe(1);
    expect(secondSuite.tests.length).toBe(2);
    expect(controlSuite.tests.length).toBe(1);
    store.deleteTestCase(toBeDeleted);
    expect(firstSuite.tests.length).toBe(0);
    expect(secondSuite.tests.length).toBe(1);
    expect(controlSuite.tests.length).toBe(1);
  });
});
