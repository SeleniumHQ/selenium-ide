import React from "react";
import { observer } from "mobx-react";
import ProjectStore from "../../stores/domain/ProjectStore";
import seed from "../../stores/seed";
import OmniBar from "../../components/OmniBar";
import ProjectHeader from "../../components/ProjectHeader";
import Navigation from "../Navigation";
import Editor from "../Editor";
import Console from "../Console";
import UiState from "../../stores/view/UiState";
import "../../styles/app.css";
import "../../styles/heights.css";

const project = new ProjectStore();

if (process.env.NODE_ENV !== "production") {
  seed(project);
}

@observer export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { project };
    this.moveTest = this.moveTest.bind(this);
  }
  moveTest(testItem, toSuite) {
    const destination = this.state.project.suites.find((suite) => (suite.id === toSuite));
    const origin = this.state.project.suites.find((suite) => (suite.id === testItem.suite));
    const test = origin.tests.find(test => (test.id === testItem.id));

    destination.addTestCase(test);
    origin.removeTestCase(test);
  }
  render() {
    return (
      <div>
        <OmniBar />
        <ProjectHeader title={this.state.project.name} changeName={this.state.project.changeName} />
        <div style={{
          float: "left"
        }}>
          <Navigation tests={this.state.project.tests} suites={this.state.project.suites} moveTest={this.moveTest} />
        </div>
        <Editor test={UiState.selectedTest ? this.state.project.tests.find(test => (test.id === UiState.selectedTest)) : null} />
        <div style={{
          clear: "left"
        }}></div>
        <Console />
      </div>
    );
  }
}
