// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

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
          selectedTests={ModalState.editedSuite ? ModalState.editedSuite.tests : []}
          cancelSelection={() => {ModalState.editSuite(null);}}
          completeSelection={tests => this.selectTestsForSuite(ModalState.editedSuite, tests)}
        />
        <RenameDialog
          isEditing={!!ModalState.renameState.type}
          type={ModalState.renameState.type}
          value={ModalState.renameState.value}
          verify={ModalState.renameState.verify}
          setValue={ModalState.renameState ? ModalState.renameState.done : null}
          cancel={ModalState.cancelRenaming} />
      </div>
    );
  }
  static propTypes = {
    project: PropTypes.object.isRequired
  };
}
