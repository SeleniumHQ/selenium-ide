/* eslint-disable */
import { autorun } from "mobx";
import ProjectStore from "../../../stores/domain/ProjectStore";
import Test from "../../../models/Test";

describe("Project Store", () => {
  it("should have a name", () => {
    const store = new ProjectStore("myStore");
    expect(store.name).toBe("myStore");
  });
  it("should observe the name change", () => {
    const store = new ProjectStore("myStore");
    store.name = "changed";
    const disposer = autorun(function() {
      expect(store.name).toBe("changed");
    });
    disposer();
  });
  it("should add test to the store", () => {
    const store = new ProjectStore();
    store.tests.push(new Test());
    const disposer = autorun(function() {
      expect(store.tests.length).toBe(1);
    });
    disposer();
  });
});
