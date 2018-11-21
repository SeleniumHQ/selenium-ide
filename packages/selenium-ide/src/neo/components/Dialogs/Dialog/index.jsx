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
import classNames from 'classnames'
import RemoveButton from '../../ActionButtons/Remove'
import info from '../../../assets/images/tick.png'
import warn from '../../../assets/images/warning.png'
import './style.css'

const images = {
  info,
  warn,
}

export default class DialogContainer extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.oneOf(['info', 'warn']).isRequired,
    children: PropTypes.node,
    renderTitle: PropTypes.func,
    renderImage: PropTypes.func,
    renderFooter: PropTypes.func,
    onRequestClose: PropTypes.func,
  }
  render() {
    return (
      <div
        className={classNames(
          'dialog',
          `dialog--${this.props.type}`,
          this.props.className
        )}
      >
        <div className="dialog__header">
          <div className="dialog__cover-image">
            {this.props.renderImage ? (
              this.props.renderImage()
            ) : (
              <img height="30" src={images[this.props.type]} />
            )}
          </div>
          <div className="dialog__title">
            {this.props.renderTitle ? (
              this.props.renderTitle()
            ) : (
              <h2>{this.props.title}</h2>
            )}
          </div>
          <RemoveButton
            onClick={
              this.props.onRequestClose ? this.props.onRequestClose : null
            }
            style={{
              color: 'white',
              position: 'absolute',
              top: 0,
              right: 0,
            }}
          />
        </div>
        <div className="dialog__contents">
          <form
            onSubmit={e => {
              e.preventDefault()
            }}
          >
            <div>{this.props.children}</div>
            {this.props.renderFooter ? (
              <div className="dialog__footer">{this.props.renderFooter()}</div>
            ) : null}
          </form>
        </div>
      </div>
    )
  }
}
