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
import Dropzone from "react-dropzone";
import classNames from "classnames";
import Modal from "../Modal";
import ModalHeader from "../ModalHeader";
import FlatButton from "../FlatButton";
import "./style.css";

export default class ImportDialog extends React.Component {
  static propTypes = {
    cancel: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    onDrop: PropTypes.func.isRequired
  };
  render() {
    return (
      <Modal className="import-dialog" isOpen={true}>
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <ModalHeader title="Import suite" close={this.props.cancel} />
          <p>{"Hey there, I see you wanted to import an old IDE suite, I need you to give me these test cases that you've used."}</p>
          <Dropzone accept="text/html" onDrop={this.props.onDrop}>
            <ul>
              {this.props.files.map(({name, accepted}) => (
                <li key={name} className={classNames({accepted})}>{name}</li>
              ))}
            </ul>
          </Dropzone>
          <hr />
          <span className="right">
            <FlatButton onClick={this.props.cancel}>Cancel</FlatButton>
          </span>
          <div className="clear"></div>
        </form>
      </Modal>
    );
  }
}
