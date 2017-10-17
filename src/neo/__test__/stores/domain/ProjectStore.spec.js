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
  it("should add test to the store", () => {
    const store = new ProjectStore();
    const disposer = observe(store, "tests", (change) => {
      expect(change.newValue.length).toBe(1);
    });
    store.tests.push(new Test());
    disposer();
  });
});
