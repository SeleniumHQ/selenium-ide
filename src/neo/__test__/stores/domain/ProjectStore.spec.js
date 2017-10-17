/* eslint-disable */
import { observe } from "mobx";
import ProjectStore from "../../../stores/domain/ProjectStore";
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
});
