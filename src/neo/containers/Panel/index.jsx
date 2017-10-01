import React from "react";
import PropTypes from "prop-types";
import Navigation from "../Navigation";
import Editor from "../Editor";
import "../../styles/app.css";

const tests = [
  { id: "1",
    name: "Test One"
  },
  { id: "2",
    name: "Test Two"
  },
  { id: "3",
    name: "Test Three"
  },
  { id: "4",
    name: "Test Four"
  }];

export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [{
        name: "Project One",
        tests: [...tests]
      },
        {
          name: "Project Two",
          tests: [...tests]
        },
        {
          name: "Project Three",
          tests: [...tests]
        },
        {
          name: "Project Four",
          tests: [...tests]
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
        <div style={{
          float: "left"
        }}>
          <Navigation projects={this.state.projects} selectedTest={this.state.selectedTest} selectTest={this.selectTest} />
        </div>
        <Editor />
        <div style={{
          clear: "left"
        }}></div>
      </div>
    );
  }
}
