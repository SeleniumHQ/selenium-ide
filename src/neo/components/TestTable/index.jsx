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
            <TestRow />
            <TestRow />
            <TestRow />
          </tbody>
        </table>
      </div>
    );
  }
}
