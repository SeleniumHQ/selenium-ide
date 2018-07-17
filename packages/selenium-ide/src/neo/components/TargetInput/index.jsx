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

import React from "react";
import PropTypes from "prop-types";
import { PropTypes as MobxPropTypes } from "mobx-react";
import AutoComplete from "../AutoComplete";
import Input from "../FormInput";

export default class TargetInput extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    targets: MobxPropTypes.arrayOrObservableArray,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func
  };
  render() {
    return (this.props.targets && this.props.targets.length ?
      <Input name={this.props.name} label={this.props.label}>
        <AutoComplete
          getItemValue={(item) => (
            item[0]
          )}
          items={this.props.targets.peek()}
          renderDefaultStyledItem={(item) =>
            <TargetSuggestion locator={item[0]} strategy={item[1]} />
          }
          value={this.props.value}
          inputProps={{ disabled: this.props.disabled }}
          onChange={(e) => { if (this.props.onChange) this.props.onChange(e.target.value); }}
          onSelect={(value) => { if (this.props.onChange) this.props.onChange(value); }}
        />
      </Input> :
      <Input
        name={this.props.name}
        label={this.props.label}
        value={this.props.value}
        disabled={this.props.disabled}
        onChange={(value) => { if (this.props.onChange) this.props.onChange(value); }} />
    );
  }
}

class TargetSuggestion extends React.Component {
  static propTypes = {
    locator: PropTypes.string.isRequired,
    strategy: PropTypes.string
  };
  render() {
    return (
      <span style={{
        display: "flex"
      }}>
        <span style={{
          flexGrow: "1",
          wordBreak: "break-word"
        }}>{this.props.locator}</span>
        {this.props.strategy && <span style={{
          color: "#929292",
          flexGrow: "initial",
          paddingLeft: "10px"
        }}>{this.props.strategy}</span>}
      </span>
    );
  }
}
