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

/*eslint-disable react/prop-types*/

//Already positioned

import React from 'react'
import PropTypes from 'prop-types'
import ActionButton from '../ActionButton'
import classNames from 'classnames'
import './style.css'

export default class SpeedGaugeButton extends React.Component {
  static propTypes = {
    speed: PropTypes.number,
  }
  // speed 默认是5 范围（1-5） 1-2-3-4-5 5个等级
  static defaultProps = {
    speed: 5,
  }
  render() {
    const props = { ...this.props }
    delete props.isMenuOpen
    return (
      // Create class="si-gauge" 的ActionButton
      // data-tip--->Test execution speed
      <ActionButton
        data-tip="<p>Test execution speed</p>"
        {...props}
        className={classNames(
          `si-gauge-${this.props.speed}`,
          { active: this.props.isMenuOpen },
          this.props.className
        )}
      >
        {/*创建一个下拉箭头视图*/}
        <i className="si-caret" />
      </ActionButton>
    )
  }
}
