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
import { observer } from "mobx-react";
import "./style.css";

@observer
export default class CommandReference extends React.Component {
  render() {
    return (
      <div className="command-reference">
        <ul>
          { this.props.currentCommand.name &&
            <li className="name">
              {this.props.currentCommand.name}&nbsp;
              {this.props.currentCommand.target && <em>{this.props.currentCommand.target.name}</em>}
              {this.props.currentCommand.value && <em>, {this.props.currentCommand.value.name}</em>}
            </li> }
          { this.props.currentCommand.description && <li className="description">{this.props.currentCommand.description}</li> }
          <br />
          <li>arguments:</li>
          { this.props.currentCommand.target &&
            <li className="argument">{this.props.currentCommand.target.name} - {this.props.currentCommand.target.value}</li> }
        </ul>
      </div>
    );
  }
}
