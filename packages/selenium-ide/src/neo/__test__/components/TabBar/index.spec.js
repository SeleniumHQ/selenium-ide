import React from "react";
import { renderIntoDocument, fireEvent, cleanup } from "react-testing-library";
import TabBar from "../../../components/TabBar";

describe("<TabBar />", () => {
  afterEach(cleanup);
  xit("should show an unread notification when the log updates", () => {
  });
  xit("should not show an unread notification when the log updates and viewing the log tab", () => {
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
