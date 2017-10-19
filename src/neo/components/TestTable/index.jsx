import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { PropTypes as MobxPropTypes } from "mobx-react";
import TestRow from "../TestRow";
import "./style.css";

@observer export default class TestTable extends React.Component {
  static propTypes = {
    commands: MobxPropTypes.arrayOrObservableArray,
    selectedCommand: PropTypes.string,
    selectCommand: PropTypes.func
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
            { this.props.commands ? this.props.commands.map((command) => (
              <TestRow
                key={command.id}
                command={command.command}
                target={command.target}
                value={command.value}
                state={ this.props.selectedCommand === command.id ? "Selected" : null }
                onClick={this.props.selectCommand ? () => { this.props.selectCommand(command); } : null}
              />
            )) : null }
          </tbody>
        </table>
      </div>
    );
  }
}
