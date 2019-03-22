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
      >
        <RenameDialogContents {...this.props} />
      </Modal>
    )
  }
}

class RenameDialogContents extends React.Component {
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
      type: props.type,
    }
  }
  handleChange(inputValue) {
    this.setState({
      value: inputValue,
      valid: this.props.verify(inputValue),
    })
  }
  render() {
    const content = {
      title: this.props.isNewTest
        ? 'Name your new test'
        : this.props.type === 'project'
          ? 'Name your new project'
          : `${this.state.isRenaming ? 'Rename' : 'Add new'} ${
              this.state.type
            }`,
      bodyTop: this.props.isNewTest ? (
        <span>Please provide a name for your new test.</span>
      ) : this.props.type === 'project' ? (
        <span>Please provide a name for your new project.</span>
      ) : (
        undefined
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
        this.props.isNewTest || this.props.type === 'project'
          ? 'OK'
          : this.state.isRenaming
            ? 'rename'
            : 'add',
      cancelButton: this.props.isNewTest ? 'later' : 'cancel',
      inputLabel: this.props.isNewTest
        ? 'test name'
        : this.state.type + ' name',
    }
    return (
      <DialogContainer
        title={content.title}
        type={this.state.valid ? 'info' : 'warn'}
        renderFooter={() => (
          <span
            className="right"
            style={{
              display: 'flex',
            }}
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
      >
        {content.bodyTop}
        <LabelledInput
          name={this.state.type + 'Name'}
          label={content.inputLabel}
          value={this.state.value}
          onChange={this.handleChange.bind(this)}
          autoFocus
        />
        {!this.state.valid && (
          <span className="message">
            A {this.props.type} with this name already exists
          </span>
        )}
        {content.bodyBottom}
      </DialogContainer>
    )
  }
  static propTypes = {
    isEditing: PropTypes.bool,
    type: PropTypes.string,
    value: PropTypes.string,
    verify: PropTypes.func,
    cancel: PropTypes.func,
    setValue: PropTypes.func,
    isNewTest: PropTypes.bool,
  }
}
