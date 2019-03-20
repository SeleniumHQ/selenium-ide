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
import { PropTypes as MobxPropTypes } from 'mobx-react'
import SyntaxHighlighter, {
  registerLanguage,
} from 'react-syntax-highlighter/light'
import fortran from 'react-syntax-highlighter/languages/hljs/fortran'
import stylus from 'react-syntax-highlighter/languages/hljs/stylus'
import ini from 'react-syntax-highlighter/languages/hljs/ini'
import { xcode } from 'react-syntax-highlighter/styles/hljs'
import AutoComplete from '../AutoComplete'
import Input from '../FormInput'
import './style.css'

registerLanguage('fortran', fortran)
registerLanguage('stylus', stylus)
registerLanguage('ini', ini)

export default class TargetInput extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    targets: MobxPropTypes.arrayOrObservableArray,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
  }
  render() {
    return this.props.targets && this.props.targets.length ? (
      <Input
        name={this.props.name}
        className="target-input"
        label={this.props.label}
      >
        <AutoComplete
          id={this.props.name}
          getItemValue={item => item[0]}
          items={this.props.targets.slice()}
          renderDefaultStyledItem={item => (
            <TargetSuggestion locator={item[0]} strategy={item[1]} />
          )}
          value={this.props.value}
          inputProps={{ name: this.props.name, disabled: this.props.disabled }}
          onChange={e => {
            if (this.props.onChange) this.props.onChange(e.target.value)
          }}
          onSelect={value => {
            if (this.props.onChange) this.props.onChange(value)
          }}
        />
      </Input>
    ) : (
      <Input
        id={this.props.name}
        name={this.props.name}
        label={this.props.label}
        value={this.props.value}
        disabled={this.props.disabled}
        onChange={value => {
          if (this.props.onChange) this.props.onChange(value)
        }}
      />
    )
  }
}

class TargetSuggestion extends React.Component {
  static propTypes = {
    locator: PropTypes.string.isRequired,
    strategy: PropTypes.string,
  }
  render() {
    let language = 'ini'
    if (this.props.strategy) {
      if (this.props.strategy === 'css') {
        language = 'stylus'
      } else if (this.props.strategy.startsWith('xpath')) {
        language = 'fortran'
      }
    }
    return (
      <span
        style={{
          display: 'flex',
        }}
      >
        <span
          className="code"
          style={{
            flexGrow: '1',
            wordBreak: 'break-word',
          }}
        >
          <SyntaxHighlighter language={language} style={xcode}>
            {this.props.locator}
          </SyntaxHighlighter>
        </span>
        {this.props.strategy && (
          <span
            style={{
              color: '#929292',
              flexGrow: 'initial',
              paddingLeft: '10px',
            }}
          >
            {this.props.strategy}
          </span>
        )}
      </span>
    )
  }
}
