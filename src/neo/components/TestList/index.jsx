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
    suite: PropTypes.string,
    removeTest: PropTypes.func.isRequired
  };
  render() {
    return (
      <ul className={classNames("tests", {"active": !this.props.collapsed})}>
        {this.props.tests.filter(({name}) => (name.indexOf(UiState.filterTerm) !== -1)).map((test) => (
          <li key={test.id}>
            {this.props.suite
              ? <DraggableTest id={test.id} name={test.name} suite={this.props.suite} selected={test.id === UiState.selectedTest} selectTest={UiState.selectTest} dragInProgress={UiState.dragInProgress} setDrag={UiState.setDrag} removeTest={() => { this.props.removeTest(test); }} />
              : <Test id={test.id} name={test.name} selected={test.id === UiState.selectedTest} selectTest={UiState.selectTest} removeTest={() => { this.props.removeTest(test); }} /> }
          </li>
        ))}
      </ul>
    );
  }
}
