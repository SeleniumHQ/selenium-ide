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
import Markdown from '../../Markdown'
import DialogContainer from '../Dialog'
import classNames from 'classnames'
import './style.css'

export default class AlertDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
      options: {},
    }
    this.show = this.show.bind(this)
    this.props.show(this.show)
  }
  static propTypes = {
    show: PropTypes.func.isRequired,
  }
  show(options) {
    if (this.state.isOpen) {
      this.state.rej(
        new Error('Another alert was opened while this was showing')
      )
    }
    return new Promise((res, rej) => {
      this.setState({
        isOpen: true,
        options,
        res,
        rej,
      })
    })
  }
  close(status) {
    this.setState({
      isOpen: false,
    })
    this.state.res(status)
  }
  render() {
    const modalTitleElement = 'alertTitle'
    const modalDescriptionElement = 'alertDescription'

    return (
      <Modal
        className={classNames('stripped', 'alert')}
        isOpen={this.state.isOpen}
        onRequestClose={this.close.bind(this, false)}
        modalTitle={modalTitleElement}
        modalDescription={modalDescriptionElement}
      >
        <DialogContainer
          type={this.state.options.type ? this.state.options.type : 'info'}
          title={this.state.options.title}
          buttons={[
            this.state.options.cancelLabel ? (
              <FlatButton onClick={this.close.bind(this, false)} key="cancel">
                {this.state.options.cancelLabel}
              </FlatButton>
            ) : null,
            <FlatButton
              type="submit"
              onClick={this.close.bind(this, true)}
              key="ok"
              autoFocus
            >
              {this.state.options.confirmLabel || 'OK'}
            </FlatButton>,
          ]}
          onRequestClose={this.close.bind(this, false)}
          modalTitle={modalTitleElement}
          modalDescription={modalDescriptionElement}
        >
          {this.state.options.isMarkdown ? (
            <Markdown className="markdown">
              {this.state.options.description}
            </Markdown>
          ) : (
            <div>{this.state.options.description}</div>
          )}
        </DialogContainer>
      </Modal>
    )
  }
}
