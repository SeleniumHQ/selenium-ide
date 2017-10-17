/* eslint-disable */
import Test from "../../models/Test";

describe("Test model", () => {
  it("new test should be named 'Utitled Test'", () => {
    expect((new Test()).name).toBe("Untitled Test");
  });
  it("Tests should have randomly generated identifiers", () => {
    expect((new Test()).id).not.toBe((new Test()).id);
  });
});
