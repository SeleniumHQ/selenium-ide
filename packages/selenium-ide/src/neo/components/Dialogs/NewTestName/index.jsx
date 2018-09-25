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
import DialogContainer from "../DialogContainer";
import LabelledInput from "../LabelledInput";
import FlatButton from "../FlatButton";

export default class NewTestNameDialog extends React.Component {
  static propTypes = {
    isNamingNewTest: PropTypes.bool
  };
  render() {
    return (
      <Modal isOpen={this.props.isNamingNewTest}>
        <NewTestNameDialogContents {...this.props} />
      </Modal>
    );
  }
}

class NewTestNameDialogContents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      testName: ""
    };
    this.onTestNameChange = this.onTestNameChange.bind(this);
  }
  static propTypes = {
    onTestNameSelection: PropTypes.func,
    cancel: PropTypes.func
  };
  onTestNameChange(testName) {
    this.setState({ testName });
  }
  render() {
    return (
      <DialogContainer
        title={"Name your new test"}
        type={"info"}
        renderFooter={() => (
          <div className="right">
            <FlatButton
              onClick={this.props.cancel}
            >Later</FlatButton>
            <FlatButton
              type="submit"
              disabled={!this.state.testName}
              onClick={() => {this.props.onTestNameSelection(this.state.testName);}}
            >OK</FlatButton>
          </div>
        )}
        onRequestClose={this.props.cancel}
      >
        <p>
          Please provide a name for your new test.
        </p>
        <LabelledInput
          name="newTestName"
          label="new test name"
          placeholder="your descriptive test name"
          value={this.state.testName}
          onChange={this.onTestNameChange}
        />
        <p>
          You can change the name of your test at any time by clicking the {"..."} icon next to it.
        </p>
      </DialogContainer>
    );
  }
}
