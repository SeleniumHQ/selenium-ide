import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import Alert from "../../components/Alert";
import TestSelector from "../../components/TestSelector";
import RenameDialog from "../../components/RenameDialog";
import ModalState from "../../stores/view/ModalState";

@observer
export default class Modal extends Component {
  constructor(props) {
    super(props);
    ModalState._project = props.project;
  }
  selectTestsForSuite(suite, tests) {
    suite.replaceTestCases(tests);
    ModalState.editSuite(null);
  }
  render() {
    return (
      <div>
        <Alert show={show => ModalState.showAlert = show} />
        <TestSelector
          isEditing={!!ModalState.editedSuite}
          tests={this.props.project.tests}
          selectedTests={ModalState.editedSuite ? ModalState.editedSuite.tests : null}
          cancelSelection={() => {ModalState.editSuite(null);}}
          completeSelection={tests => this.selectTestsForSuite(ModalState.editedSuite, tests)}
        />
        <RenameDialog
          isEditing={!!ModalState.renameState.type}
          type={ModalState.renameState.type}
          value={ModalState.renameState.value}
          setValue={ModalState.renameState ? ModalState.renameState.done : null}
          cancel={ModalState.cancelRenaming} />
      </div>
    );
  }
  static propTypes = {
    project: PropTypes.object.isRequired
  };
}
