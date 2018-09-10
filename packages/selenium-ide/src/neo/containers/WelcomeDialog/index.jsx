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
import ProjectStore from "../../stores/domain/ProjectStore";
import { loadProject } from "../../IO/filesystem";
import Panel from "../Panel";
import { observer } from "mobx-react";
import UiState from "../../stores/view/UiState";

@observer
export default class WelcomeDialog extends React.Component {
  startRecording() {
    UiState.completeWelcome();
    UiState.toggleRecord();
  }

  openProject(file) {
    let project = new ProjectStore();
    loadProject.bind(undefined, project)(file);
    UiState.completeWelcome();
    UiState.setProject(project);
  }

  render() {
    if (UiState.completedWelcome) {
      return (<Panel />);
    } else {
      return (
        <div>
          <Record disabled={ false } isRecording={ false } onClick={ this.startRecording }/>
          <OpenButton onFileSelected={ this.openProject } />
        </div>
      );
    }
  }
}
