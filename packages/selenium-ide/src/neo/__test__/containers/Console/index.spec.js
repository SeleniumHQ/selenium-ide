import React from "react";
import { renderIntoDocument, cleanup } from "react-testing-library";
import Console from "../../../containers/Console";

describe("<Console />", () => {
  afterEach(cleanup);
  it("should render", () => {
    const { container } = renderIntoDocument(<Console />);
    const consoleElement = container.querySelector(".console");
    expect(consoleElement).not.toBe(null);
  });
});
