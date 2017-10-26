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
    removeSuite: PropTypes.func.isRequired,
    moveTest: PropTypes.func.isRequired
  };
  render() {
    return (
      <ul className="projects">
        {this.props.suites.map(suite => (
          <li key={suite.id}>
            <Suite id={suite.id} name={suite.name} tests={suite.tests} selectTests={() => {this.props.selectTests(suite);}} remove={() => {this.props.removeSuite(suite);}} moveTest={this.props.moveTest} removeTest={suite.removeTestCase} />
          </li>
        ))}
      </ul>
    );
  }
}
