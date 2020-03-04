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
import TestSelector from '../../components/Dialogs/TestSelector'
import ImportDialog from '../../components/Dialogs/ImportDialog'
import SuiteSettings from '../../components/Dialogs/SuiteSettings'
import RenameDialog from '../../components/Dialogs/Rename'
import BaseUrlDialog from '../../components/Dialogs/BaseUrl'
import WelcomeDialog from '../../components/Dialogs/Welcome'
import AlertDialog from '../../components/Dialogs/Alert'
import ModalState from '../../stores/view/ModalState'
import NewWindowConfigurationDialog from '../../components/Dialogs/NewWindowConfiguration'
import ExportDialog from '../../components/Dialogs/Export'
import { isProduction } from '../../../common/utils'
import UiState from '../../stores/view/UiState'
import { exportCodeToFile } from '../../code-export'

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
        <AlertDialog show={show => (ModalState.showAlert = show)} />
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
          isInvalid={!!ModalState.baseUrlState.isInvalid}
          confirmLabel={ModalState.baseUrlState.confirmLabel}
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
        <NewWindowConfigurationDialog
          isOpen={ModalState.newWindowConfigurationState}
          cancel={ModalState.toggleNewWindowConfiguration}
          id="new-window"
          name="new-window"
          label="Opens Window"
          command={UiState.selectedCommand || {}}
          isUniqueWindowName={ModalState.isUniqueWindowName}
        />
        <ExportDialog
          isExporting={!!ModalState.exportState.isExporting}
          cancelSelection={() => {
            ModalState.cancelCodeExport()
          }}
          completeSelection={(
            selectedLanguages,
            enableOriginTracing,
            beforeEachOptions,
            enableDescriptionAsComment
          ) =>
            exportCodeToFile(selectedLanguages, ModalState.exportPayload, {
              enableOriginTracing,
              beforeEachOptions,
              enableDescriptionAsComment,
            })
          }
        />
      </div>
    )
  }
  static propTypes = {
    project: PropTypes.object.isRequired,
    createNewProject: PropTypes.func.isRequired,
  }
}
