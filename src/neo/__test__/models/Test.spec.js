/* eslint-disable */
import Test from "../../models/Test";

describe("Test model", () => {
  it("new test should be named 'Utitled Test'", () => {
    expect((new Test()).name).toBe("Untitled Test");
  });
});
