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
import { DEFAULT_TIMEOUT } from '../../../models/Suite'
import Modal from '../../Modal'
import DialogContainer from '../Dialog'
import Input from '../../FormInput'
import FlatButton from '../../FlatButton'
import Checkbox from '../../Checkbox'
import Markdown from '../../Markdown'
import './style.css'

export default class SuiteSettings extends React.Component {
  static propTypes = {
    isEditing: PropTypes.bool,
    timeout: PropTypes.number,
    isParallel: PropTypes.bool,
    persistSession: PropTypes.bool,
    submit: PropTypes.func,
    cancel: PropTypes.func,
  }
  render() {
    return (
      <Modal
        className="stripped suite-settings-dialog"
        isOpen={this.props.isEditing}
        onRequestClose={this.props.cancel}
      >
        <SuiteSettingsContent {...this.props} />
      </Modal>
    )
  }
}

class SuiteSettingsContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timeout: props.timeout ? props.timeout : '',
      isParallel: !!props.isParallel,
      persistSession: !!props.persistSession,
    }
  }
  static propTypes = {
    isEditing: PropTypes.bool,
    timeout: PropTypes.number,
    isParallel: PropTypes.bool,
    persistSession: PropTypes.bool,
    submit: PropTypes.func,
    cancel: PropTypes.func,
  }
  onTimeoutChange(value) {
    this.setState({
      timeout: value,
    })
  }
  onIsParallelChange(e) {
    this.setState({
      isParallel: e.target.checked,
    })
  }
  onPersistSessionChange(e) {
    this.setState({
      persistSession: e.target.checked,
    })
  }
  render() {
    const persistSession = !this.state.isParallel && this.state.persistSession
    return (
      <DialogContainer
        title="Suite properties"
        onRequestClose={this.props.cancel}
        renderFooter={() => (
          <span className="right">
            <FlatButton onClick={this.props.cancel}>cancel</FlatButton>
            <FlatButton
              type="submit"
              onClick={() => {
                this.props.submit({
                  timeout: parseInt(this.state.timeout) || DEFAULT_TIMEOUT,
                  isParallel: this.state.isParallel,
                  persistSession: this.state.persistSession,
                })
              }}
              style={{
                marginRight: '0',
              }}
            >
              submit
            </FlatButton>
          </span>
        )}
      >
        <div className="form-contents">
          <Input
            name="suite-timeout"
            type="number"
            label="Timeout (seconds)"
            placeholder={DEFAULT_TIMEOUT}
            value={this.state.timeout}
            width={130}
            onChange={this.onTimeoutChange.bind(this)}
          />
          <Checkbox
            label="Run in parallel"
            checked={this.state.isParallel}
            width={130}
            onChange={this.onIsParallelChange.bind(this)}
          />
          <Markdown className="markdown">
            {
              'Running in parallel works only in the [runner](https://www.seleniumhq.org/selenium-ide/docs/en/introduction/command-line-runner/)'
            }
          </Markdown>
          <Checkbox
            label="Persist session"
            checked={persistSession}
            disabled={this.state.isParallel}
            width={130}
            onChange={this.onPersistSessionChange.bind(this)}
          />
          <div>(not recommended)</div>
          {persistSession && (
            <Markdown className="markdown">
              {
                'Persisting session will not reset the WebDriver session and variables between test run, which will result in ["non-idempotent non-isolated"](http://jasonpolites.github.io/tao-of-testing/ch4-1.1.html#rule-10-ensure-tests-are-isolated-and-idempotent) tests that are difficult to debug.'
              }
            </Markdown>
          )}
        </div>
      </DialogContainer>
    )
  }
}
