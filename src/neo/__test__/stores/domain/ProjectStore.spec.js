/* eslint-disable */
import ProjectStore from "../../../stores/domain/ProjectStore";
import Test from "../../../models/Test";

describe("Project Store", () => {
  it("should have a name", () => {
    const store = new ProjectStore("myStore");
    expect(store.name).toBe("myStore");
  });
  it("should add test to the store", () => {
    const store = new ProjectStore();
    store.tests.push(new Test());
    expect(store.tests.length).toBe(1);
  });
});
