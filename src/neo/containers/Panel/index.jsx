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
import Modal from "../Modal";
import UiState from "../../stores/view/UiState";
import "../../styles/app.css";
import "../../styles/heights.css";

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
    this.moveTest = this.moveTest.bind(this);
  }
  moveTest(testItem, destination) {
    const origin = this.state.project.suites.find((suite) => (suite.id === testItem.suite));
    const test = origin.tests.find(test => (test.id === testItem.id));

    destination.addTestCase(test);
    origin.removeTestCase(test);
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
            createSuite={this.createSuite}
            removeSuite={this.state.project.deleteSuite}
            createTest={this.createTest}
            moveTest={this.moveTest}
            deleteTest={this.deleteTest}
          />
        </div>
        <Editor
          url={this.state.project.url}
          urls={this.state.project.urls}
          setUrl={this.state.project.setUrl}
          test={UiState.selectedTest ? this.state.project.tests.find(test => (test.id === UiState.selectedTest.testId)) : null}
        />
        <div style={{
          clear: "left"
        }}></div>
        <Console />
        <Modal project={this.state.project} />
      </div>
    );
  }
}
