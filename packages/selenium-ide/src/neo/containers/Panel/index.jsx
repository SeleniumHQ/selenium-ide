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

import browser from "webextension-polyfill";
import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import SplitPane from "react-split-pane";
import parser from "ua-parser-js";
import classNames from "classnames";
import { modifier } from "modifier-keys";
import Tooltip from "../../components/Tooltip";
import storage from "../../IO/storage";
import ProjectStore from "../../stores/domain/ProjectStore";
import seed from "../../stores/seed";
import SuiteDropzone from "../../components/SuiteDropzone";
import PauseBanner from "../../components/PauseBanner";
import ProjectHeader from "../../components/ProjectHeader";
import Navigation from "../Navigation";
import Editor from "../Editor";
import Console from "../Console";
import Modal from "../Modal";
import Changelog from "../../components/Changelog";
import UiState from "../../stores/view/UiState";
import PlaybackState from "../../stores/view/PlaybackState";
import "../../side-effects/contextMenu";
import "../../styles/app.css";
import "../../styles/font.css";
import "../../styles/layout.css";
import "../../styles/resizer.css";

import { loadProject, saveProject } from "../../IO/filesystem";
import "../../IO/notifications";

const isProduction = process.env.NODE_ENV === "production";

if (process.env.NODE_ENV !== "test") {
  const api = require("../../../api");
  browser.runtime.onMessage.addListener(api.default);
}

if (parser(window.navigator.userAgent).os.name === "Windows") {
  require("../../styles/conditional/scrollbar.css");
  require("../../styles/conditional/button-direction.css");
}

function initProject() {
  const loadedProject = UiState._project;
  const project = loadedProject ? observable(loadedProject) : observable(new ProjectStore());
  UiState.setProject(project);
  if (!loadedProject) {
    if (isProduction) {
      const suite = project.createSuite("Default Suite");
      const test = project.createTestCase("Untitled");
      suite.addTestCase(test);
      UiState.selectTest(test);
    } else {
      seed(project, 0);
    }
  }
  project.setModified(false);
  return project;
}

initProject();

function firefox57WorkaroundForBlankPanel () {
  // TODO: remove this as soon as Mozilla fixes https://bugzilla.mozilla.org/show_bug.cgi?id=1425829
  // browser. windows. create () displays blank windows (panel, popup or detached_panel)
  // The trick to display content is to resize the window...
  // We do not check the browser since this doesn't affect chrome at all

  function getCurrentWindow () {
    return browser.windows.getCurrent();
  }

  getCurrentWindow().then((currentWindow) => {
    const updateInfo = {
      width: currentWindow.width,
      height: currentWindow.height + 1 // 1 pixel more than original size...
    };
    browser.windows.update(currentWindow.id, updateInfo);
  });
}

if (browser.windows) {
  firefox57WorkaroundForBlankPanel();
}

@DragDropContext(HTML5Backend)
@observer export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    const project = initProject();
    this.state = { project };
    this.keyDownHandler = window.document.body.onkeydown = this.handleKeyDown.bind(this);
    if (isProduction) {
      this.resizeHandler = window.addEventListener("resize", this.handleResize.bind(this, window));
      this.quitHandler = window.addEventListener("beforeunload", (e) => {
        if (project.modified) {
          const confirmationMessage = "You have some unsaved changes, are you sure you want to leave?";

          e.returnValue = confirmationMessage;
          return confirmationMessage;
        }
      });
      this.moveInterval = setInterval(() => {
        storage.set({
          origin: {
            top: window.screenY,
            left: window.screenX
          }
        });
      }, 3000);
    }
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
  handleKeyDown(e) {
    modifier(e);
    const key = e.key.toUpperCase();
    const primaryAndShift = (e.primaryKey && e.shiftKey);
    const onlyPrimary = (e.primaryKey && !e.secondaryKey);
    const noModifiers = (!e.primaryKey && !e.secondaryKey);

    // when editing these, remember to edit the button's tooltip as well
    if (onlyPrimary && key === "S") {
      e.preventDefault();
      saveProject(this.state.project);
    } else if (onlyPrimary && key === "O" && this.openFile) {
      e.preventDefault();
      this.openFile();
    } else if (onlyPrimary && key === "1") {
      // test view
      e.preventDefault();
      UiState.changeView(UiState.views[+key - 1]);
    } else if (onlyPrimary && key === "2") {
      // suite view
      e.preventDefault();
      UiState.changeView(UiState.views[+key - 1]);
    } else if (onlyPrimary && key === "3") {
      // execution view
      e.preventDefault();
      UiState.changeView(UiState.views[+key - 1]);
    } else if (primaryAndShift && e.code === "KeyR" && isProduction) {
      // run suite
      e.preventDefault();
      if (PlaybackState.canPlaySuite) {
        PlaybackState.playSuiteOrResume();
      }
    } else if (onlyPrimary && key === "R" && isProduction) {
      // run test
      e.preventDefault();
      if (!PlaybackState.isPlayingSuite) {
        PlaybackState.playTestOrResume();
      }
    } else if (onlyPrimary && key === "P") {
      // pause
      e.preventDefault();
      PlaybackState.pauseOrResume();
    } else if (onlyPrimary && key === ".") {
      // stop
      e.preventDefault();
      PlaybackState.abortPlaying();
    } else if (onlyPrimary && key === "'") {
      // step over
      e.preventDefault();
      PlaybackState.stepOver();
    } else if (onlyPrimary && key === "Y") {
      // disable breakpoints
      e.preventDefault();
      PlaybackState.toggleDisableBreakpoints();
    } else if (onlyPrimary && key === "U") {
      // record
      e.preventDefault();
      if (!PlaybackState.isPlaying) {
        UiState.toggleRecord();
      }
    } else if (noModifiers && key === "ESCAPE") {
      UiState.toggleConsole();
    }
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
    if (isProduction) {
      clearInterval(this.moveInterval);
      window.removeEventListener("resize", this.resizeHandler);
      window.removeEventListener("beforeunload", this.quitHandler);
    }
  }
  render() {
    return (
      <div className="container">
        <SuiteDropzone loadProject={loadProject.bind(undefined, this.state.project)}>
          <SplitPane
            split="horizontal"
            minSize={UiState.minContentHeight}
            maxSize={UiState.maxContentHeight}
            size={UiState.windowHeight - UiState.consoleHeight}
            onChange={(size) => UiState.resizeConsole(window.innerHeight - size)}
            style={{
              position: "initial"
            }}
          >
            <div className="wrapper">
              <PauseBanner />
              <ProjectHeader
                title={this.state.project.name}
                changed={this.state.project.modified}
                changeName={this.state.project.changeName}
                openFile={(openFile) => {
                  this.openFile = openFile;
                }}
                load={loadProject.bind(undefined, this.state.project)}
                save={() => saveProject(this.state.project)}
              />
              <div className={classNames("content", { dragging: UiState.navigationDragging })}>
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
                    duplicateTest={this.state.project.duplicateTestCase}
                  />
                  <Editor
                    url={this.state.project.url}
                    urls={this.state.project.urls}
                    setUrl={this.state.project.setUrl}
                    test={UiState.displayedTest}
                    callstackIndex={UiState.selectedTest.stack}
                  />
                </SplitPane>
              </div>
            </div>
            <Console height={UiState.consoleHeight} restoreSize={UiState.restoreConsoleSize} />
          </SplitPane>
          <Modal project={this.state.project} />
          <Changelog />
          <Tooltip />
        </SuiteDropzone>
      </div>
    );
  }
}
