import React from "react";
import ProjectList from "../ProjectList";

const tests = [ "Test One", "Test Two", "Test Three", "Test Four" ];

export default class Navigation extends React.Component {
  render() {
    return (
      <aside>
        <h3>Test Case</h3>
        <ProjectList projects = {[ {
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
        }]} />
      </aside>
    );
  }
}
