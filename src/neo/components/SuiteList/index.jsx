import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { PropTypes as MobxPropTypes } from "mobx-react";
import Suite from "../Suite";
import "./style.css";

@observer export default class SuiteList extends React.Component {
  static propTypes = {
    suites: MobxPropTypes.arrayOrObservableArray.isRequired,
    selectTests: PropTypes.func.isRequired,
    rename: PropTypes.func.isRequired,
    removeSuite: PropTypes.func.isRequired,
    moveTest: PropTypes.func.isRequired
  };
  render() {
    return (
      <ul className="projects">
        {this.props.suites.map(suite => (
          <li key={suite.id}>
            <Suite suite={suite} selectTests={() => {this.props.selectTests(suite);}} rename={this.props.rename} remove={() => {this.props.removeSuite(suite);}} moveTest={this.props.moveTest} />
          </li>
        ))}
      </ul>
    );
  }
}
