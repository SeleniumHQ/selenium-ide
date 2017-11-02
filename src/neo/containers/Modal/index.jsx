import React, { Component } from "react";
import Alert from "../../components/Alert";
import TestSelector from "../../components/TestSelector";
import RenameDialog from "../../components/RenameDialog";
import UiState from "../../stores/view/UiState";

export default class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.cancelRenaming = this.cancelRenaming.bind(this);
    this.rename = this.rename.bind(this);
    props.rename(this.rename);
  }
  cancelRenaming() {
    this.setState({ rename: undefined });
  }
  rename(value, cb) {
    console.log("kaki");
    const self = this;
    this.setState({
      rename: {
        value,
        done: (...argv) => {
          cb(...argv);
          self.cancelRenaming();
        }
      }
    });
  }
  render() {
    return (
      <div>
        <Alert show={show => this.show = show} />
        {UiState.editedSuite ? <TestSelector
          isEditing={!!UiState.editedSuite}
          tests={this.state.project.tests}
          selectedTests={UiState.editedSuite ? UiState.editedSuite.tests : null}
          cancelSelection={() => {UiState.editSuite(null);}}
          completeSelection={tests => this.selectTestsForSuite(UiState.editedSuite, tests)}
        /> : null}
        {this.state.rename
          ? <RenameDialog isEditing={!!this.state.rename} value={this.state.rename.value} setValue={this.state.rename ? this.state.rename.done : null} cancel={this.cancelRenaming} />
          : null}
      </div>
    );
  }
}
