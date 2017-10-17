import React from "react";
import PropTypes from "prop-types";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContextProvider } from "react-dnd";
import Suite from "../Suite";
import "./style.css";

export default class SuiteList extends React.Component {
  static propTypes = {
    suites: PropTypes.array.isRequired,
    selectedTest: PropTypes.string,
    selectTest: PropTypes.func.isRequired,
    moveTest: PropTypes.func.isRequired
  };
  render() {
    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <ul className="projects">
          {this.props.suites.map(({id, name, tests}) => (
            <li key={id}>
              <Suite id={id} name={name} tests={tests} selectedTest={this.props.selectedTest} selectTest={this.props.selectTest} moveTest={this.props.moveTest} />
            </li>
          ))}
        </ul>
      </DragDropContextProvider>
    );
  }
}
