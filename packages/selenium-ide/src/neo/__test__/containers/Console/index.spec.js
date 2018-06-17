import React from "react";
import { cleanup, fireEvent, renderIntoDocument } from "react-testing-library";
import Console from "../../../containers/Console";
import Logger from "../../../stores/view/Logs";

describe("<Console />", () => {
  afterEach(cleanup);
  it("should render", () => {
    const { container } = renderIntoDocument(<Console />);
    const console = container.querySelector(".console");
    const tabBar = container.querySelector(".tabbar");
    const viewPort = container.querySelector(".viewport");
    const logs = container.querySelector(".logs");
    expect(console).not.toBe(null);
    expect(tabBar).not.toBe(null);
    expect(viewPort).not.toBe(null);
    expect(logs).not.toBe(null);
  });
  xit("should not display an unread notification on the log tab when it is in focus and the log's been updated", () => {
    const { container } = renderIntoDocument(<Console />);
    Logger.log("blah");
    expect(container).not.toBe(null);
  });
  xit("should display an unread notification on the log tab when the reference tab is in focus and the log has been updated)", () => {
    const { container } = renderIntoDocument(<Console />);
    const referenceTab = container.querySelector(".reference");
    fireEvent(referenceTab, new MouseEvent("click", {
      bubbles: true,
      cancelable: true
    }));
    const commandReference = container.querySelector(".command-reference");
    expect(commandReference).not.toBe(null);
  });
});
