import React from "react";
import { renderIntoDocument, fireEvent, cleanup } from "react-testing-library";
import TabBar from "../../../components/TabBar";

describe("<TabBar />", () => {
  afterEach(cleanup);
  it("displays an unread notification on the log tab when the unread status is set to true", () => {
    const { container } = renderIntoDocument(<TabBar tabs={[{ name: "Log", unread: true }, { name: "Reference" }]} />);
    const unreadLogTab = container.querySelector(".log.unread");
    const unreadReferenceTab = container.querySelector(".reference.unread");
    expect(unreadLogTab).not.toBe(null);
    expect(unreadReferenceTab).toBe(null);
  });
  it("should return the selected tab name when selected", () => {
    const handleTabChange = (passedSelectedTab) => {
      expect(passedSelectedTab).toBe("Reference");
    };
    const { container } = renderIntoDocument(<TabBar tabs={[{ name: "Log" }, { name: "Reference" }]} tabChanged={handleTabChange}/>);
    const referenceTab = container.querySelector(".reference");
    fireEvent(referenceTab, new MouseEvent("click", {
      bubbles: true,
      cancelable: true
    }));
  });
});
