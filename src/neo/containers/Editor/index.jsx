import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import UiState from "../../stores/view/UiState";
import ToolBar from "../../components/ToolBar";
import UrlBar from "../../components/UrlBar";
import TestTable from "../../components/TestTable";
import CommandForm from "../../components/CommandForm";

@observer export default class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.addCommand = this.addCommand.bind(this);
    this.removeCommand = this.removeCommand.bind(this);
  }
  static propTypes = {
    test: PropTypes.object,
    url: PropTypes.string.isRequired,
    urls: PropTypes.array,
    setUrl: PropTypes.func.isRequired
  };
  addCommand(index, command) {
    if (command) {
      const newCommand = command.clone();
      this.props.test.insertCommandAt(newCommand, index);
    } else {
      const newCommand = this.props.test.createCommand(index);
      newCommand.setCommand("open");
    }
  }
  removeCommand(command) {
    if (UiState.selectedCommand === command) {
      UiState.selectCommand(null);
    }
    this.props.test.removeCommand(command);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.test && this.props.test !== nextProps.test) {
      UiState.selectCommand(null);
    }
  }
  render() {
    return (
      <main style={{
        display: "flow-root"
      }}>
        <ToolBar />
        <UrlBar url={this.props.url} urls={this.props.urls} setUrl={this.props.setUrl} />
        <TestTable
          commands={this.props.test ? this.props.test.commands : null}
          selectedCommand={UiState.selectedCommand ? UiState.selectedCommand.id : null}
          selectCommand={UiState.selectCommand}
          addCommand={this.addCommand}
          removeCommand={this.removeCommand}
          clearAllCommands={this.props.test ? this.props.test.clearAllCommands : null}
          swapCommands={this.props.test ? this.props.test.swapCommands : null}
        />
        <CommandForm
          command={UiState.selectedCommand}
          setCommand={this.handleCommandChange}
          isSelecting={UiState.isSelectingTarget}
        />
      </main>
    );
  }
}
