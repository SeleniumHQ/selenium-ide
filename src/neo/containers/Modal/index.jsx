import React, { Component } from "react";
import { observer } from "mobx-react";
import Alert from "../../components/Alert";
import TestSelector from "../../components/TestSelector";
import RenameDialog from "../../components/RenameDialog";
import UiState from "../../stores/view/UiState";
import ModalState from "../../stores/view/ModalState";

@observer
export default class Modal extends Component {
  selectTestsForSuite(suite, tests) {
    suite.replaceTestCases(tests);
    ModalState.editSuite(null);
  }
  render() {
    return (
      <div>
        <Alert show={show => this.show = show} />
        {ModalState.editedSuite ? <TestSelector
          isEditing={!!ModalState.editedSuite}
          tests={this.props.tests}
          selectedTests={ModalState.editedSuite ? ModalState.editedSuite.tests : null}
          cancelSelection={() => {ModalState.editSuite(null);}}
          completeSelection={tests => this.selectTestsForSuite(ModalState.editedSuite, tests)}
        /> : null}
        {ModalState.renameState
          ? <RenameDialog
            isEditing={!!ModalState.renameState}
            value={ModalState.renameState.value}
            setValue={ModalState.renameState ? ModalState.renameState.done : null}
            cancel={ModalState.cancelRenaming} />
          : null}
      </div>
    );
  }
}
