import React from "react";
import TestCaseProjectList from "../TestCaseProjectList";

export default class TestCaseNavigation extends React.Component {
  render() {
    return (
      <aside>
        <h3>Test Case</h3>
        <TestCaseProjectList />
      </aside>
    );
  }
}
