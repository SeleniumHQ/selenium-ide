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
import FlatButton from '../../FlatButton'
import LabelledInput from '../../LabelledInput'
import DialogContainer from '../Dialog'
import classNames from 'classnames'
import './style.css'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import {isJDXQACompatible} from "../../../../common/utils";

export default class RenameDialog extends React.Component {
  static propTypes = {
    isEditing: PropTypes.bool,
    type: PropTypes.string,
    value: PropTypes.string,
    verify: PropTypes.func,
    cancel: PropTypes.func,
    setValue: PropTypes.func,
  }
  render() {
    return (
      <Modal
        className={classNames('stripped', 'rename-dialog')}
        isOpen={this.props.isEditing}
        onRequestClose={this.props.cancel}
        modalTitle={RenameDialogContents.modalTitleElement}
        modalDescription={RenameDialogContents.modalDescriptionElement}
      >
        <RenameDialogContents {...this.props} />
      </Modal>
    )
  }
}

class RenameDialogContents extends React.Component {
  static modalTitleElement = 'renameTitle'
  static modalDescriptionElement = 'renameDescription'
  constructor(props) {
    super(props)
    this.state = {
      isRenaming: !!props.value,
      value:
        props.isNewTest || props.type === 'project'
          ? ''
          : props.value
            ? props.value
            : '',
      valid: true,
      validErrorMsg: '',
      type: props.type,
    }
  }
  handleChange(inputValue) {
    let verifyResult = this.props.verify(inputValue)

    let strictAC =
      typeof this.props.strictAutocomplete == 'boolean'
        ? this.props.strictAutocomplete
        : this.props.strictAutocomplete(inputValue)

    if (strictAC && !this.props.autocompleteItems.includes(inputValue)) {
      verifyResult = {
        isValid: false,
        errorMsg: 'Value must be matching one of the provided options',
      }
    }
    if (verifyResult['isValid'] === undefined) verifyResult['isValid'] = false

    if (verifyResult['errorMsg'] === undefined)
      verifyResult['errorMsg'] = 'Error message is not defined'

    this.setState({
      valid: verifyResult.isValid,
      validErrorMsg: verifyResult.errorMsg,
      value: inputValue,
    })
  }
  render() {
    const content = {
      title: this.props.isNewTest
        ? 'Name your new test'
        : this.props.type === 'project'
          ? 'Name your new project'
          : this.props.type === 'package'
            ? 'Set package'
            : `${this.state.isRenaming ? 'Rename' : 'Add new'} ${
                this.props.type
              }`,
      bodyTop: this.props.isNewTest ? (
        <span id="renameDescription">
          Please provide a name for your new test.
        </span>
      ) : this.props.type === 'project' ? (
        <span id="renameDescription">
          Please provide a name for your new project.
        </span>
      ) : (
        <span
          className="hidden"
          id="renameDescription"
        >{`Please provide a name for your ${this.state.type}.`}</span>
      ),
      bodyBottom: this.props.isNewTest ? (
        <span>
          You can change it at any time by clicking the{' '}
          <span className={classNames('si-more', 'more-icon')} /> icon next to
          its name in the tests panel.
        </span>
      ) : this.props.type === 'project' ? (
        <span>
          You can change the name of your project at any time by clicking it and
          entering a new name.
        </span>
      ) : (
        undefined
      ),
      submitButton:
        this.props.isNewTest ||
        this.props.type === 'project' ||
        this.props.type === 'package'
          ? 'OK'
          : this.state.isRenaming
            ? 'rename'
            : 'add',
      cancelButton: this.props.isNewTest ? 'later' : 'cancel',
      inputLabel: this.props.isNewTest
        ? 'test name'
        : this.props.type + ' name',
    }
    return (
      <DialogContainer
        title={content.title}
        type={this.state.valid ? 'info' : 'warn'}
        buttons={[
          <FlatButton
            disabled={this.props.isNewTest && !!this.state.value}
            onClick={this.props.cancel}
            key="cancel"
          >
            {content.cancelButton}
          </FlatButton>,
          <FlatButton
            type="submit"
            disabled={!this.state.value || !this.state.valid}
            onClick={() => {
              this.props.setValue(this.state.value)
            }}
            style={{
              marginRight: '0',
            }}
            key="ok"
          >
            <FlatButton
              disabled={this.props.isNewTest && !!this.state.value}
              onClick={this.props.cancel}
            >
              {content.cancelButton}
            </FlatButton>
            <FlatButton
              type="submit"
              disabled={!this.state.value || !this.state.valid}
              onClick={() => {
                this.props.setValue(this.state.value)
                this.setState({ value: '' })
              }}
              style={{
                marginRight: '0',
              }}
            >
              {content.submitButton}
            </FlatButton>
          </span>
        )}
        onRequestClose={this.props.cancel}
        modalTitle={RenameDialogContents.modalTitleElement}
        modalDescription={RenameDialogContents.modalDescriptionElement}
      >
        {content.bodyTop}

        {this.props.autocompleteItems && isJDXQACompatible ? (
          <Autocomplete
            options={this.props.autocompleteItems}
            id="flat-demo"
            freeSolo
            selectOnFocus
            disableOpenOnFocus
            /* eslint-disable-next-line no-unused-vars */
            onChange={(e, val) => this.handleChange(val)}
            renderInput={params => (
              <TextField
                {...params}
                onChange={e => this.handleChange(e.target.value)}
                name={this.props.type + 'Name'}
                value={this.state.value}
                label={content.inputLabel}
                margin="normal"
              />
            )}
          />
        ) : (
          <LabelledInput
            name={this.props.type + 'Name'}
            label={content.inputLabel}
            value={this.state.value}
            onChange={this.handleChange.bind(this)}
            autoFocus
          />
        )}

        {!this.state.valid && (
          <span className="message">{this.state.validErrorMsg}</span>
        )}
        {content.bodyBottom}
      </DialogContainer>
    )
  }
  static propTypes = {
    isEditing: PropTypes.bool,
    autocompleteItems: PropTypes.array,
    type: PropTypes.string,
    value: PropTypes.string,
    verify: PropTypes.func,
    cancel: PropTypes.func,
    setValue: PropTypes.func,
    isNewTest: PropTypes.bool,
  }
}
