import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import UiState from "../../stores/view/UiState";
import ToolBar from "../../components/ToolBar";
import UrlBar from "../../components/UrlBar";
import TestTable from "../../components/TestTable";
import CommandForm from "../../components/CommandForm";
import "./style.css";

@observer export default class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.selectCommandByIndex = this.selectCommandByIndex.bind(this);
    this.addCommand = this.addCommand.bind(this);
    this.removeCommand = this.removeCommand.bind(this);
  }
  static propTypes = {
    test: PropTypes.object,
    url: PropTypes.string.isRequired,
    urls: PropTypes.array,
    setUrl: PropTypes.func.isRequired
  };
  selectCommandByIndex(index) {
    const { test } = this.props;
    if (index >= 0 && index < test.commands.length) {
      UiState.selectCommand(test.commands[index]);
    }
  }
  addCommand(index, command) {
    if (command) {
      const newCommand = command.clone();
      this.props.test.insertCommandAt(newCommand, index);
      return newCommand;
    } else {
      const newCommand = this.props.test.createCommand(index);
      return newCommand;
    }
  }
  removeCommand(index, command) {
    const { test } = this.props;
    test.removeCommand(command);
    if (UiState.selectedCommand === command) {
      if (test.commands.length > index) {
        UiState.selectCommand(test.commands[index]);
      } else if (test.commands.length) {
        UiState.selectCommand(test.commands[test.commands.length - 1]);
      } else {
        UiState.selectCommand(null);
      }
    }
  }
  render() {
    return (
      <main className="editor">
        <ToolBar />
        <UrlBar url={this.props.url} urls={this.props.urls} setUrl={this.props.setUrl} />
        <TestTable
          commands={this.props.test ? this.props.test.commands : null}
          selectedCommand={UiState.selectedCommand ? UiState.selectedCommand.id : null}
          selectCommand={UiState.selectCommand}
          selectCommandByIndex={this.selectCommandByIndex}
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
