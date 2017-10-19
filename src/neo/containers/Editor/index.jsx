import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import UiState from "../../stores/view/UiState";
import ToolBar from "../../components/ToolBar";
import TestTable from "../../components/TestTable";
import CommandForm from "../../components/CommandForm";

@observer export default class Editor extends React.Component {
  static propTypes = {
    test: PropTypes.object
  };
  render() {
    return (
      <main style={{
        display: "flow-root"
      }}>
        <ToolBar />
        <TestTable commands={this.props.test ? this.props.test.commands : null} selectedCommand={UiState.selectedCommand ? UiState.selectedCommand.id : null} selectCommand={UiState.selectCommand} />
        <CommandForm />
      </main>
    );
  }
}
