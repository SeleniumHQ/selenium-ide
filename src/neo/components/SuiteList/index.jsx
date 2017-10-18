import React from "react";
import PropTypes from "prop-types";
import { PropTypes as MobxPropTypes } from "mobx-react";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContextProvider } from "react-dnd";
import Suite from "../Suite";
import "./style.css";

export default class SuiteList extends React.Component {
  static propTypes = {
    suites: MobxPropTypes.arrayOrObservableArray.isRequired,
    moveTest: PropTypes.func.isRequired
  };
  render() {
    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <ul className="projects">
          {this.props.suites.map(({id, name, tests}) => (
            <li key={id}>
              <Suite id={id} name={name} tests={tests} moveTest={this.props.moveTest} />
            </li>
          ))}
        </ul>
      </DragDropContextProvider>
    );
  }
}
