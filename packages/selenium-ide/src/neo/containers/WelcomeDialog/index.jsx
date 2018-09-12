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
import OpenButton from "../../components/ActionButtons/Open";
import Record from "../../components/ActionButtons/Record";
import DismissButton from "../../components/ActionButtons/Dismiss";
import ProjectStore from "../../stores/domain/ProjectStore";
import { loadProject } from "../../IO/filesystem";
import Panel from "../Panel";
import { observer } from "mobx-react";
import UiState from "../../stores/view/UiState";
import project from "../../../../package.json";
import "./style.css";

@observer
export default class WelcomeDialog extends React.Component {
  startRecording() {
    UiState.completeWelcome();
    UiState.toggleRecord();
  }

  openProject(file) {
    let project = new ProjectStore();
    loadProject(project, file);
    UiState.setProject(project);
    UiState.completeWelcome();
  }

  dismiss() {
    UiState.completeWelcome();
  }

  render() {
    if (UiState.completedWelcome) {
      return (<Panel />);
    } else {
      return (
        <div id="welcome-dialog">
          <div className="intro"><h2>Selenium IDE</h2></div>
          <div className="intro"><p>Version {project.version}</p></div>
          <ul>
            <li><div className="icon"><Record disabled={ false } isRecording={ false } onClick={ this.startRecording } /></div> <div className="description">Record your first test</div></li>
            <li><div className="icon"><OpenButton onFileSelected={ this.openProject } className="icon" /></div><div className="description">Open existing project</div></li>
            <li><div className="icon"><DismissButton onClick={ this.dismiss } /></div><div className="description">Dismiss this window</div></li>
          </ul>
        </div>
      );
    }
  }
}
