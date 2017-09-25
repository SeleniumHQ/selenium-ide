import React from "react";
import PropTypes from "prop-types";
import Project from "../Project";
import "./style.css";

export default class ProjectList extends React.Component {
  static propTypes = {
    projects: PropTypes.array.isRequired
  };
  render() {
    return (
      <ul className="projects">
        {this.props.projects.map(project => (
          <li key={project}>
            <Project name={project} />
          </li>
        ))}
      </ul>
    );
  }
}
