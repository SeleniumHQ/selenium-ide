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

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import Alert from '../../components/Alert'
import TestSelector from '../../components/TestSelector'
import ImportDialog from '../../components/ImportDialog'
import SuiteSettings from '../../components/SuiteSettings'
import RenameDialog from '../../components/Dialogs/Rename'
import BaseUrlDialog from '../../components/Dialogs/BaseUrl'
import WelcomeDialog from '../../components/Dialogs/Welcome'
import ModalState from '../../stores/view/ModalState'
import { isProduction } from '../../../content/utils'

@observer
export default class Modal extends Component {
  constructor(props) {
    super(props)
    ModalState._project = props.project
  }
  selectTestsForSuite(suite, tests) {
    suite.replaceTestCases(tests)
    ModalState.editSuite(null)
  }
  render() {
    return (
      <div>
        <Alert show={show => (ModalState.showAlert = show)} />
        <TestSelector
          isEditing={!!ModalState.editedSuite}
          tests={this.props.project.tests}
          selectedTests={
            ModalState.editedSuite ? ModalState.editedSuite.tests : []
          }
          cancelSelection={() => {
            ModalState.editSuite(null)
          }}
          completeSelection={tests =>
            this.selectTestsForSuite(ModalState.editedSuite, tests)
          }
        />
        <RenameDialog
          isEditing={!!ModalState.renameState.type}
          type={ModalState.renameState.type}
          value={ModalState.renameState.value}
          verify={ModalState.renameState.verify}
          setValue={ModalState.renameState ? ModalState.renameState.done : null}
          cancel={ModalState.renameState.cancel}
          isNewTest={ModalState.renameState.isNewTest}
        />
        <ImportDialog
          isImporting={!!ModalState.importSuiteState.suite}
          suite={ModalState.importSuiteState.suite}
          onComplete={ModalState.importSuiteState.onComplete}
          cancel={ModalState.cancelImport}
        />
        <SuiteSettings
          isEditing={ModalState.suiteSettingsState.editing}
          timeout={ModalState.suiteSettingsState.timeout}
          isParallel={ModalState.suiteSettingsState.isParallel}
          persistSession={ModalState.suiteSettingsState.persistSession}
          submit={
            ModalState.suiteSettingsState
              ? ModalState.suiteSettingsState.done
              : null
          }
          cancel={ModalState.cancelSuiteSettings}
        />
        <BaseUrlDialog
          isSelectingUrl={ModalState.baseUrlState.selecting}
          isInvalid={ModalState.baseUrlState.isInvalid}
          onUrlSelection={ModalState.baseUrlState.done}
          cancel={ModalState.baseUrlState.cancel}
        />
        {isProduction ? (
          <WelcomeDialog
            isWelcomed={ModalState.welcomeState.started}
            project={this.props.project}
            createNewProject={this.props.createNewProject}
            hideWelcome={ModalState.hideWelcome}
            completeWelcome={ModalState.completeWelcome}
          />
        ) : null}
      </div>
    )
  }
  static propTypes = {
    project: PropTypes.object.isRequired,
    createNewProject: PropTypes.func.isRequired,
  }
}
