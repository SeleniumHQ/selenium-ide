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

import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../../Modal'
import DialogContainer from '../Dialog'
import FlatButton from '../../FlatButton'
import Checkbox from '../../Checkbox'
import Input from '../../FormInput'
import { availableLanguages } from '../../../code-export'
import ModalState from '../../../stores/view/ModalState'
import UiState from '../../../stores/view/UiState'
import './style.css'

export default class ExportDialog extends React.Component {
  static propTypes = {
    isExporting: PropTypes.bool.isRequired,
    cancelSelection: PropTypes.func.isRequired,
    completeSelection: PropTypes.func.isRequired,
  }
  render() {
    return (
      <Modal
        className="stripped language-selector"
        isOpen={this.props.isExporting}
        onRequestClose={this.props.cancelSelection}
        modalTitle={ExportContent.modalTitleElement}
        modalDescription={ExportContent.modalDescriptionElement}
      >
        <ExportContent {...this.props} />
      </Modal>
    )
  }
}

class ExportContent extends React.Component {
  static modalTitleElement = 'renameTitle'
  static modalDescriptionElement = 'renameDescription'
  constructor(props) {
    super(props)
    this.state = {
      selectedLanguages: [UiState.selectedExportLanguage],
      enableOriginTracing: false,
      enableGridConfig: UiState.gridConfigEnabled,
      gridConfigUrl: UiState.specifiedRemoteUrl,
    }
  }
  static propTypes = {
    cancelSelection: PropTypes.func.isRequired,
    completeSelection: PropTypes.func.isRequired,
  }
  selectLanguage(_isSelected, language) {
    UiState.selectExportLanguage(language)
    this.setState({ selectedLanguages: [language] })
  }
  toggleOriginTracing() {
    this.setState({ enableOriginTracing: !this.state.enableOriginTracing })
  }
  toggleDescriptionAsComment() {
    this.setState({
      enableDescriptionAsComment: !this.state.enableDescriptionAsComment,
    })
  }
  toggleGridConfig() {
    UiState.toggleGridConfig()
    this.setState({ enableGridConfig: !this.state.enableGridConfig })
  }
  onUrlChange(input) {
    UiState.specifyRemoteUrl(input)
    this.setState({ gridConfigUrl: input })
  }
  render() {
    return (
      <DialogContainer
        title="Select language"
        onRequestClose={this.props.cancel}
        buttons={[
          <FlatButton onClick={this.props.cancelSelection} key="cancel">
            cancel
          </FlatButton>,
          <FlatButton
            disabled={!this.state.selectedLanguages.length}
            type="submit"
            onClick={() => {
              this.props
                .completeSelection(
                  this.state.selectedLanguages,
                  this.state.enableOriginTracing,
                  {
                    gridUrl: this.state.enableGridConfig
                      ? this.state.gridConfigUrl
                      : undefined,
                  },
                  this.state.enableDescriptionAsComment
                )
                .catch(error => {
                  this.props.cancelSelection()
                  ModalState.showAlert({
                    title: 'Unable to complete code export',
                    description: error.message,
                    confirmLabel: 'OK',
                  })
                })
            }}
            style={{
              marginRight: '0',
            }}
            key="ok"
          >
            export
          </FlatButton>,
        ]}
        modalTitle={ExportContent.modalTitleElement}
        modalDescription={ExportContent.modalDescriptionElement}
      >
        <ExportList
          selectedLanguages={this.state.selectedLanguages}
          selectLanguage={this.selectLanguage.bind(this)}
        />
        <hr />
        <Checkbox
          label="Include origin tracing code comments"
          checked={this.state.enableOriginTracing}
          form={true}
          onChange={this.toggleOriginTracing.bind(this)}
        />
        <Checkbox
          label="Include step description as a separate comment"
          checked={this.state.enableDescriptionAsComment}
          form={true}
          onChange={this.toggleDescriptionAsComment.bind(this)}
        />
        <Checkbox
          label="Export for use on Selenium Grid"
          checked={this.state.enableGridConfig}
          form={true}
          onChange={this.toggleGridConfig.bind(this)}
        />
        {this.state.enableGridConfig ? (
          <Input
            id="grid-url"
            name="grid-url"
            label="Remote URL"
            value={this.state.gridConfigUrl}
            onChange={value => {
              this.onUrlChange(value)
            }}
          />
        ) : (
          undefined
        )}
      </DialogContainer>
    )
  }
}

class ExportList extends React.Component {
  static propTypes = {
    selectedLanguages: PropTypes.array.isRequired,
    selectLanguage: PropTypes.func.isRequired,
  }
  handleChange(language, e) {
    this.props.selectLanguage(e.target.checked, language)
  }
  render() {
    const languages = availableLanguages()
    return (
      <ul className="languages">
        {Object.keys(languages)
          .sort()
          .map(language => (
            <li key={language} className="language">
              <input
                type="radio"
                value={language}
                id={language}
                checked={this.props.selectedLanguages.includes(language)}
                onChange={this.handleChange.bind(this, language)}
              />
              <label htmlFor={language}>
                {languages[language].displayName}
              </label>
            </li>
          ))}
      </ul>
    )
  }
}
