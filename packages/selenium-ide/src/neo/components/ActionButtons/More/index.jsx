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
import ActionButton from '../ActionButton'
import classNames from 'classnames'

export default class MoreButton extends React.Component {
  render() {
    const props = { ...this.props }
    delete props.canFocus
    delete props.isMenuOpen
    return (
      <ActionButton
        tabIndex={this.props.canFocus ? '0' : '-1'}
        aria-expanded={this.props.isMenuOpen}
        {...props}
        className={classNames(
          { 'no-focus': !this.props.canFocus },
          'si-more',
          { active: this.props.isMenuOpen },
          this.props.className
        )}
      /> // eslint-disable-line react/prop-types
    )
  }
}
