import React from "react";
import "./style.css";

export default class TestTable extends React.Component {
  render() {
    return (
      <table className="test-table">
        <thead>
          <tr>
            <th>Command</th>
            <th>Target</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    );
  }
}
