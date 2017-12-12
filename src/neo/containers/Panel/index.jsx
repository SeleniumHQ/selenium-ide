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
import { observable } from "mobx";
import { observer } from "mobx-react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import SplitPane from "react-split-pane";
import parser from "ua-parser-js";
import classNames from "classnames";
import Tooltip from "../../components/Tooltip";
import storage from "../../IO/storage";
import ProjectStore from "../../stores/domain/ProjectStore";
import seed from "../../stores/seed";
import modify from "../../side-effects/modify";
import ProjectHeader from "../../components/ProjectHeader";
import Navigation from "../Navigation";
import Editor from "../Editor";
import Console from "../Console";
import Modal from "../Modal";
import UiState from "../../stores/view/UiState";
import "../../styles/app.css";
import "../../styles/font.css";
import "../../styles/layout.css";
import "../../styles/resizer.css";

import { loadProject, saveProject } from "../../IO/filesystem";
import "../../IO/SideeX/record";
import "../../IO/SideeX/playback";

if (parser(window.navigator.userAgent).os.name === "Windows") {
  require("../../styles/conditional/scrollbar.css");
  require("../../styles/conditional/button-direction.css");
}

const project = observable(new ProjectStore());

UiState.setProject(project);

if (process.env.NODE_ENV === "production") {
  UiState.selectTest(project.createTestCase("Untitled"));
} else {
  seed(project);
}

modify(project);

@DragDropContext(HTML5Backend)
@observer export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { project };
    this.moveTest = this.moveTest.bind(this);
    this.resizeHandler = window.addEventListener("resize", this.handleResize.bind(this, window));
    this.quitHandler = window.addEventListener("beforeunload", (e) => {
      if (project.modified) {
        const confirmationMessage = "You have some unsaved changes, are you sure you want to leave?";

        e.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    });
  }
  moveTest(testItem, destination) {
    const origin = this.state.project.suites.find((suite) => (suite.id === testItem.suite));
    const test = origin.tests.find(test => (test.id === testItem.id));

    destination.addTestCase(test);
    origin.removeTestCase(test);
  }
  handleResize(currWindow) {
    UiState.setWindowHeight(currWindow.innerHeight);
    storage.set({
      size: {
        height: currWindow.outerHeight,
        width: currWindow.outerWidth
      }
    });
  }
  navigationDragStart() {
    UiState.setNavigationDragging(true);
    UiState.resizeNavigation(UiState.navigationWidth);
    UiState.setNavigationHover(true);
  }
  navigationDragEnd() {
    UiState.setNavigationDragging(false);
    UiState.setNavigationHover(false);
  }
  componentWillUnmount() {
    window.removeEventListener(this.resizeHandler);
    window.removeEventListener(this.quitHandler);
  }
  render() {
    return (
      <div className="container">
        <SplitPane
          split="horizontal"
          minSize={UiState.minContentHeight}
          maxSize={UiState.maxContentHeight}
          size={UiState.windowHeight - UiState.consoleHeight}
          onChange={(size) => UiState.resizeConsole(window.innerHeight - size)}>
          <div className="wrapper">
            <ProjectHeader
              title={this.state.project.name}
              changed={this.state.project.modified}
              changeName={this.state.project.changeName}
              load={loadProject.bind(undefined, project)}
              save={() => saveProject(project)}
            />
            <div className={classNames("content", {dragging: UiState.navigationDragging})}>
              <SplitPane
                split="vertical"
                minSize={UiState.minNavigationWidth}
                maxSize={UiState.maxNavigationWidth}
                size={UiState.navigationWidth}
                onChange={UiState.resizeNavigation}
                onDragStarted={this.navigationDragStart}
                onDragFinished={this.navigationDragEnd}>
                <Navigation
                  tests={UiState.filteredTests}
                  suites={this.state.project.suites}
                  createSuite={this.createSuite}
                  removeSuite={this.state.project.deleteSuite}
                  createTest={this.createTest}
                  moveTest={this.moveTest}
                  deleteTest={this.deleteTest}
                />
                <Editor
                  url={this.state.project.url}
                  urls={this.state.project.urls}
                  setUrl={this.state.project.setUrl}
                  test={UiState.selectedTest.test}
                />
              </SplitPane>
            </div>
          </div>
          <Console height={UiState.consoleHeight} />
        </SplitPane>
        <Modal project={this.state.project} />
        <Tooltip />
      </div>
    );
  }
}
