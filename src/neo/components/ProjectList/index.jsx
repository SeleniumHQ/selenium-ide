import React from "react";
import PropTypes from "prop-types";
import Project from "../Project";

export default class ProjectList extends React.Component {
  static propTypes = {
    projects: PropTypes.array.isRequired
  };
  render() {
    return (
      <ul>
        {this.props.projects.map(project => (
          <li key = {project}>
            <Project name = {project} />
          </li>
        ))}
      </ul>
    );
  }
}
