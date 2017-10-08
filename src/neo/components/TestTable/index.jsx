import React from "react";
import TestRow from "../TestRow";
import "./style.css";

export default class TestTable extends React.Component {
  render() {
    return (
      <div className="test-table">
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>Target</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <TestRow command="open" target="/" state="Passed" />
            <TestRow command="click and wait" target="link=store" state="Passed" />
            <TestRow command="assert text present" value="The item is available" state="Failed" />
          </tbody>
        </table>
      </div>
    );
  }
}
