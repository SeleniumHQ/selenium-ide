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
import { loadProject } from "../../IO/filesystem";
import { observer } from "mobx-react";
import UiState from "../../stores/view/UiState";
import project from "../../../../package.json";
import Modal from "../Modal";
import logoFile from "../../assets/images/selenume_blue_white32@3x.svg";
import { OpenInput } from "../ActionButtons/Open";
import "./style.css";

@observer
export default class WelcomeDialog extends React.Component {
  render() {
    return (
      <Modal className="welcome-dialog" isOpen={!UiState.completedWelcome} >
        <WelcomeDialogContents {...this.props} />
      </Modal>
    );
  }
}

class WelcomeDialogContents extends React.Component {
  startRecording() {
    UiState.completeWelcome();
    UiState.toggleRecord();
  }

  openProject(file) {
    loadProject(this.props.project, file);
    UiState.completeWelcome();
  }

  dismiss() {
    UiState.completeWelcome();
  }

  openDocs() {
    window.open("https://www.seleniumhq.org/docs/02_selenium_ide.jsp", "_blank");
  }

  render() {
    return (
      <React.Fragment>
        <div className="intro">
          <div className="logo"><img alt="se-ide-logo" src={logoFile} /></div>
          <div className="copy">
            <div className="welcome">Welcome to Selenium IDE!</div>
            <div className="version">Version {project.version}</div>
          </div>
        </div>
        <div className="main-body">
          <div>What would you like to do?</div>
          <ul className="options">
            <li><a onClick={this.startRecording}>Record a new test in a new project</a></li>
            <li className="file-open">
              <OpenInput onFileSelected={this.openProject.bind(this)} labelMarkup={<div>Open an existing project</div>} />
            </li>
            <li><a onClick={this.dismiss}>Close this dialog</a></li>
          </ul>
          <div className="footer">
            To learn more on Selenium IDE and how to use it visit the <a onClick={this.openDocs}>the Selenium IDE project page</a>.
          </div>
        </div>
      </React.Fragment>
    );
  }
  static propTypes = {
    project: PropTypes.object.isRequired
  }
}
