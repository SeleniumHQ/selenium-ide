import React from "react";
import { PropTypes as MobxPropTypes } from "mobx-react";
import TestRow from "../TestRow";
import "./style.css";

export default class TestTable extends React.Component {
  static propTypes = {
    commands: MobxPropTypes.arrayOrObservableArray
  };
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
            { this.props.commands ? this.props.commands.map(({ id, command, target, value }) => (
              <TestRow key={id} command={command} target={target} value={value} />
            )) : null }
          </tbody>
        </table>
      </div>
    );
  }
}
