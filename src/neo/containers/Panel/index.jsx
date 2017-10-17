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

function sortTests(tests) {
  return tests.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    } else if (b.name > a.name) {
      return -1;
    } else {
      return 0;
    }
  });
}

const store = new ProjectStore();

if (process.env.NODE_ENV !== "production") {
  seed(store);
}

export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { store };
    this.selectTest = this.selectTest.bind(this);
    this.moveTest = this.moveTest.bind(this);
  }
  selectTest(testId) {
    this.setState({ selectedTest: testId });
  }
  moveTest(testItem, toSuite) {
    const destination = this.state.store.suites.find((suite) => (suite.id === toSuite));
    const origin = this.state.store.suites.find((suite) => (suite.id === testItem.suite));
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
          <Navigation suites={this.state.store.suites} selectedTest={this.state.selectedTest} selectTest={this.selectTest} moveTest={this.moveTest} />
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
