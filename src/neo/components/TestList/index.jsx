import React from "react";
import PropTypes from "prop-types";
import { PropTypes as MobxPropTypes } from "mobx-react";
import { observer } from "mobx-react";
import classNames from "classnames";
import Test, { DraggableTest } from "../Test";
import UiState from "../../stores/view/UiState";
import "./style.css";

@observer export default class TestList extends React.Component {
  static propTypes = {
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    collapsed: PropTypes.bool,
    suite: PropTypes.string
  };
  render() {
    return (
      <ul className={classNames("tests", {"active": !this.props.collapsed})}>
        {this.props.tests.filter(({name}) => (name.indexOf(UiState.filterTerm) !== -1)).map(({id, name}) => (
          <li key={id}>
            {this.props.suite
              ? <DraggableTest id={id} name={name} suite={this.props.suite} selected={id === UiState.selectedTest} selectTest={UiState.selectTest} />
              : <Test id={id} name={name} selected={id === UiState.selectedTest} selectTest={UiState.selectTest} /> }
          </li>
        ))}
      </ul>
    );
  }
}
