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
import ReactModal from 'react-modal'
import { Transition } from 'react-transition-group'
import classNames from 'classnames'
import './style.css'
import UiState from '../../stores/view/UiState'

const transitionStyles = {
  entering: {
    opacity: 0,
    transform: 'scale(0, 0)',
  },
  entered: {
    opacity: 1,
    transform: 'scale(1, 1)',
  },
  exiting: {
    opacity: 0,
    transform: 'scale(0, 0)',
  },
  exited: {
    opacity: 0,
    transform: 'scale(0, 0)',
  },
}

export default class Modal extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isOpen: PropTypes.bool,
    duration: PropTypes.number,
    children: PropTypes.node,
    transitionStyles: PropTypes.object,
    onRequestClose: PropTypes.func,
    modalTitle: PropTypes.string,
    modalDescription: PropTypes.string,
  }
  static defaultProps = {
    duration: 100,
    transitionStyles: transitionStyles,
    modalTitle: 'modalTitle',
    modalDescription: 'modalDescription',
  }
  render() {
    return (
      <Transition in={this.props.isOpen} timeout={this.props.duration}>
        {status => (
          <ReactModal
            className={classNames(
              'modal-content',
              UiState.isBigSpacingEnabled ? ' enable-big-spacing' : ''
            )}
            isOpen={this.props.isOpen}
            ariaHideApp={false}
            shouldCloseOnOverlayClick={true}
            closeTimeoutMS={this.props.duration}
            onRequestClose={this.props.onRequestClose}
            overlayClassName="modal-overlay"
            aria={{
              labelledby: this.props.modalTitle,
              describedby: this.props.modalDescription,
              modal: 'true',
            }}
          >
            <div
              className={classNames('modal', this.props.className)}
              style={this.props.transitionStyles[status]}
            >
              {this.props.children}
            </div>
          </ReactModal>
        )}
      </Transition>
    )
  }
}
