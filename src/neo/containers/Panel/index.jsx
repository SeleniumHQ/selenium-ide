import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import ProjectStore from "../../stores/domain/ProjectStore";
import seed from "../../stores/seed";
import modify from "../../side-effects/modify";
import ProjectHeader from "../../components/ProjectHeader";
import Navigation from "../Navigation";
import Editor from "../Editor";
import Console from "../Console";
import UiState from "../../stores/view/UiState";
import "../../styles/app.css";
import "../../styles/heights.css";

import Alert from "../../components/Alert";
import TestSelector from "../../components/TestSelector";
import RenameDialog from "../../components/RenameDialog";

const project = observable(new ProjectStore());

if (process.env.NODE_ENV !== "production") {
  seed(project);
}

modify(project);

@DragDropContext(HTML5Backend)
@observer export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { project };
    this.cancelRenaming = this.cancelRenaming.bind(this);
    this.rename = this.rename.bind(this);
    this.createSuite = this.createSuite.bind(this);
    this.createTest = this.createTest.bind(this);
    this.moveTest = this.moveTest.bind(this);
    this.deleteTest = this.deleteTest.bind(this);
  }
  cancelRenaming() {
    this.setState({ rename: undefined });
  }
  rename(value, cb) {
    const self = this;
    this.setState({
      rename: {
        value,
        done: (...argv) => {
          cb(...argv);
          self.cancelRenaming();
        }
      }
    });
  }
  createSuite() {
    const self = this;
    this.rename(null, (name) => {
      if (name) self.state.project.createSuite(name);
    });
  }
  createTest() {
    const self = this;
    this.rename(null, (name) => {
      if (name) self.state.project.createTestCase(name);
    });
  }
  moveTest(testItem, destination) {
    const origin = this.state.project.suites.find((suite) => (suite.id === testItem.suite));
    const test = origin.tests.find(test => (test.id === testItem.id));

    destination.addTestCase(test);
    origin.removeTestCase(test);
  }
  deleteTest(testCase) {
    this.show({
      title: testCase.name,
      description: `This will permanently delete '${testCase.name}', and remove it from all it's suites`,
      cancelLabel: "cancel",
      confirmLabel: "delete"
    }, (choseDelete) => {
      if (choseDelete) {
        this.state.project.deleteTestCase(testCase);
      }
    });
  }
  selectTestsForSuite(suite, tests) {
    suite.replaceTestCases(tests);
    UiState.editSuite(null);
  }
  render() {
    return (
      <div>
        <ProjectHeader title={this.state.project.name} changed={this.state.project.modified} changeName={this.state.project.changeName} />
        <div style={{
          float: "left"
        }}>
          <Navigation
            tests={this.state.project.tests}
            suites={this.state.project.suites}
            rename={this.rename}
            createSuite={this.createSuite}
            removeSuite={this.state.project.deleteSuite}
            createTest={this.createTest}
            moveTest={this.moveTest}
            deleteTest={this.deleteTest}
          />
        </div>
        <Editor url={this.state.project.url} urls={this.state.project.urls} setUrl={this.state.project.setUrl} test={UiState.selectedTest ? this.state.project.tests.find(test => (test.id === UiState.selectedTest)) : null} />
        <div style={{
          clear: "left"
        }}></div>
        <Console />
        <Alert show={show => this.show = show} />
        {UiState.editedSuite ? <TestSelector
          isEditing={!!UiState.editedSuite}
          tests={this.state.project.tests}
          selectedTests={UiState.editedSuite ? UiState.editedSuite.tests : null}
          cancelSelection={() => {UiState.editSuite(null);}}
          completeSelection={tests => this.selectTestsForSuite(UiState.editedSuite, tests)}
        /> : null}
        {this.state.rename
          ? <RenameDialog isEditing={!!this.state.rename} value={this.state.rename.value} setValue={this.state.rename ? this.state.rename.done : null} cancel={this.cancelRenaming} />
          : null}
      </div>
    );
  }
}
