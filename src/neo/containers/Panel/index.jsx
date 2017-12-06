import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import SplitPane from "react-split-pane";
import parser from "ua-parser-js";
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
  require("../../styles/scrollbar.css");
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
            <div className="content">
              <SplitPane
                split="vertical"
                minSize={UiState.minNavigationWidth}
                maxSize={UiState.maxNavigationWidth}
                size={UiState.navigationWidth}
                onChange={UiState.resizeNavigation}>
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
