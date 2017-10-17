import React from "react";
import PropTypes from "prop-types";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContextProvider } from "react-dnd";
import Project from "../Project";
import "./style.css";

export default class ProjectList extends React.Component {
  static propTypes = {
    projects: PropTypes.array.isRequired,
    selectedTest: PropTypes.string,
    selectTest: PropTypes.func.isRequired,
    moveTest: PropTypes.func.isRequired
  };
  render() {
    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <ul className="projects">
          {this.props.projects.map(({id, name, tests}) => (
            <li key={id}>
              <Project id={id} name={name} tests={tests} selectedTest={this.props.selectedTest} selectTest={this.props.selectTest} moveTest={this.props.moveTest} />
            </li>
          ))}
        </ul>
      </DragDropContextProvider>
    );
  }
}
