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
import { observer } from "mobx-react";
import LogMessage from "../LogMessage";
import "./style.css";

@observer
export default class LogList extends React.Component {
  componentDidUpdate() {
    this.container.scrollTo(0, 10000);
  }
  render() {
    return (
      <div className="logs" ref={container => {this.container = container;}}>
        <ul>
          {this.props.store.logs.map((log) => (
            <LogMessage key={log.id} log={log} />
          ))}
        </ul>
      </div>
    );
  }
  static propTypes = {
    store: PropTypes.object
  };
}
