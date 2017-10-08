import React from "react";
import uuidv4 from "uuid/v4";
import OmniBar from "../../components/OmniBar";
import Navigation from "../Navigation";
import Editor from "../Editor";
import Console from "../Console";
import "../../styles/app.css";
import "../../styles/heights.css";

function tests() {
  return [
    { id: uuidv4(),
      name: "Test One"
    },
    { id: uuidv4(),
      name: "Test Two"
    },
    { id: uuidv4(),
      name: "Test Three"
    },
    { id: uuidv4(),
      name: "Test Four"
    }
  ];
}

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

export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [{
        name: "Project One",
        tests: tests()
      },
      {
        name: "Project Two",
        tests: tests()
      },
      {
        name: "Project Three",
        tests: tests()
      },
      {
        name: "Project Four",
        tests: tests()
      }]
    };
    this.selectTest = this.selectTest.bind(this);
    this.moveTest = this.moveTest.bind(this);
  }
  selectTest(testId) {
    this.setState({ selectedTest: testId });
  }
  moveTest(testItem, toProject) {
    const destination = this.state.projects.find((project) => (project.name === toProject));
    const origin = this.state.projects.find((project) => (project.name === testItem.project));
    const test = origin.tests.find(test => (test.id === testItem.id));

    destination.tests.push(test);
    sortTests(destination.tests);
    origin.tests.splice(origin.tests.indexOf(test), 1);
    this.forceUpdate();
  }
  render() {
    return (
      <div>
        <OmniBar />
        <div style={{
          float: "left"
        }}>
          <Navigation projects={this.state.projects} selectedTest={this.state.selectedTest} selectTest={this.selectTest} moveTest={this.moveTest} />
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
