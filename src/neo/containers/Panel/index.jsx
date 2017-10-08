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
  }
  selectTest(testId) {
    this.setState({ selectedTest: testId });
  }
  render() {
    return (
      <div>
        <OmniBar />
        <div style={{
          float: "left"
        }}>
          <Navigation projects={this.state.projects} selectedTest={this.state.selectedTest} selectTest={this.selectTest} />
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
