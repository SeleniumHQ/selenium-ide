import React from "react";
import PropTypes from "prop-types";
import { PropTypes as MobxPropTypes } from "mobx-react";
import Suite from "../Suite";
import "./style.css";

export default class SuiteList extends React.Component {
  static propTypes = {
    suites: MobxPropTypes.arrayOrObservableArray.isRequired,
    moveTest: PropTypes.func.isRequired
  };
  render() {
    return (
      <ul className="projects">
        {this.props.suites.map(({id, name, tests}) => (
          <li key={id}>
            <Suite id={id} name={name} tests={tests} moveTest={this.props.moveTest} />
          </li>
        ))}
      </ul>
    );
  }
}
