jest.mock("../../../IO/storage");
import React from "react";
import { cleanup, fireEvent, renderIntoDocument, waitForElement } from "react-testing-library";
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
    expect(console).toBeInTheDOM();
    expect(tabBar).toBeInTheDOM();
    expect(viewPort).toBeInTheDOM();
    expect(logs).toBeInTheDOM();
  });
  it("should not display an unread log notification when viewing the log tab", () => {
    const { container } = renderIntoDocument(<Console />);
    Logger.log("blah");
    const unreadLogNotification = container.querySelector(".log.unread");
    expect(unreadLogNotification).not.toBeInTheDOM();
  });
  it("should display an unread log notification when viewing the reference tab)", async () => {
    const { container } = renderIntoDocument(<Console />);
    const referenceTab = container.querySelector(".reference");
    fireEvent.click(referenceTab);
    await waitForElement(() => container.querySelector(".command-reference"));
    Logger.log("blah");
    const unreadLogNotification = container.querySelector(".log.unread");
    expect(unreadLogNotification).toBeInTheDOM();
  });
});
