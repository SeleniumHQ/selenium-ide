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
import AutoComplete from '../AutoComplete'
import Input from '../FormInput'
import CommandName from '../CommandName'
import { Commands } from '../../models/Command'

export default class CommandInput extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
  }
  render() {
    return (
      <Input name={this.props.name} label={this.props.label}>
        <AutoComplete
          getItemValue={item => Commands.list.get(item).name}
          items={Commands.array}
          shouldItemRender={(item, value) =>
            Commands.list.get(item).name.indexOf(value) !== -1
          }
          renderDefaultStyledItem={item => <CommandName>{item}</CommandName>}
          value={this.props.value}
          inputProps={{ disabled: this.props.disabled }}
          onChange={e => {
            if (this.props.onChange) this.props.onChange(e.target.value)
          }}
          onSelect={value => {
            if (this.props.onChange) this.props.onChange(value)
          }}
        />
      </Input>
    )
  }
}
