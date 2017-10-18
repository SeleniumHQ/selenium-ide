import React from "react";
import ProjectStore from "../../stores/domain/ProjectStore";
import seed from "../../stores/seed";
import OmniBar from "../../components/OmniBar";
import ProjectHeader from "../../components/ProjectHeader";
import Navigation from "../Navigation";
import Editor from "../Editor";
import Console from "../Console";
import "../../styles/app.css";
import "../../styles/heights.css";

const project = new ProjectStore();

if (process.env.NODE_ENV !== "production") {
  seed(project);
}

export default class Panel extends React.Component {
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
    this.forceUpdate();
  }
  render() {
    return (
      <div>
        <OmniBar />
        <ProjectHeader />
        <div style={{
          float: "left"
        }}>
          <Navigation suites={this.state.project.suites} moveTest={this.moveTest} />
        </div>
        <Editor />
        <div style={{
          clear: "left"
        }}></div>
        <Console />
      </div>
    );
  }
}
