import React from "react";
import PropTypes from "prop-types";
import Project from "../Project";
import "./style.css";

export default class ProjectList extends React.Component {
  static propTypes = {
    projects: PropTypes.array.isRequired,
    selectedTest: PropTypes.string,
    selectTest: PropTypes.func.isRequired
  };
  render() {
    return (
      <ul className="projects">
        {this.props.projects.map(({name, tests}) => (
          <li key={name}>
            <Project name={name} tests={tests} selectedTest={this.props.selectedTest} selectTest={this.props.selectTest} />
          </li>
        ))}
      </ul>
    );
  }
}
