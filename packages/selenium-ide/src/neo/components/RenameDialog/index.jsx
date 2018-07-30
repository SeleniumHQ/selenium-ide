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
import Modal from "../Modal";
import ModalHeader from "../ModalHeader";
import FlatButton from "../FlatButton";
import "./style.css";

export default class RenameDialog extends React.Component {
  static propTypes = {
    isEditing: PropTypes.bool,
    type: PropTypes.string,
    value: PropTypes.string,
    verify: PropTypes.func,
    cancel: PropTypes.func,
    setValue: PropTypes.func
  };
  render() {
    return (
      <Modal className="rename-dialog" isOpen={this.props.isEditing} onRequestClose={this.props.cancel}>
        <RenameDialogContents {...this.props} />
      </Modal>
    );
  }
}

class RenameDialogContents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRenaming: !!props.value,
      value: props.value ? props.value : "",
      valid: true,
      type: props.type
    };
  }
  handleChange(e) {
    this.setState({
      value: e.target.value,
      valid: this.props.verify(e.target.value)
    });
  }
  render() {
    return (
      <form onSubmit={(e) => { e.preventDefault(); }}>
        <ModalHeader title={`${this.state.isRenaming ? "Rename" : "Add new"} ${this.state.type}`} close={this.props.cancel} />
        <input type="text" value={this.state.value} onChange={this.handleChange.bind(this)} autoFocus />
        { !this.state.valid && <span className="message">A {this.props.type} with this name already exists</span> }
        <span className="right">
          <FlatButton onClick={this.props.cancel}>Cancel</FlatButton>
          <FlatButton type="submit" disabled={!this.state.value || !this.state.valid} onClick={() => {this.props.setValue(this.state.value);}} style={{
            marginRight: "0"
          }}>{this.state.isRenaming ? "Rename" : "Add"}</FlatButton>
        </span>
        <div className="clear"></div>
      </form>
    );
  }
  static propTypes = {
    isEditing: PropTypes.bool,
    type: PropTypes.string,
    value: PropTypes.string,
    verify: PropTypes.func,
    cancel: PropTypes.func,
    setValue: PropTypes.func
  };
}
