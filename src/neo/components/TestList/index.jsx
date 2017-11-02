import React, { Component } from "react";
import PropTypes from "prop-types";
import { PropTypes as MobxPropTypes } from "mobx-react";
import { observer } from "mobx-react";
import classNames from "classnames";
import Test, { DraggableTest } from "../Test";
import UiState from "../../stores/view/UiState";
import "./style.css";

@observer 
export default class TestList extends Component {
  render() {
    return (
      <ul className={classNames("tests", {"active": !this.props.collapsed})}>
        {this.props.tests.filter(({name}) => (name.indexOf(UiState.filterTerm) !== -1)).map((test) => (
          <li key={test.id}>
            {this.props.suite ?
              <DraggableTest
                test={test}
                suite={this.props.suite}
                selected={test.id === UiState.selectedTest.testId && this.props.suite === UiState.selectedTest.suiteId}
                selectTest={UiState.selectTest}
                dragInProgress={UiState.dragInProgress}
                setDrag={UiState.setDrag}
                removeTest={() => { this.props.removeTest(test); }}
              /> :
              <Test
                test={test}
                selected={test.id === UiState.selectedTest.testId}
                selectTest={UiState.selectTest}
                renameTest={this.props.rename}
                removeTest={() => { this.props.removeTest(test); }}
              />}
          </li>
        ))}
      </ul>
    );
  }
  static propTypes = {
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    collapsed: PropTypes.bool,
    suite: PropTypes.string,
    rename: PropTypes.func,
    removeTest: PropTypes.func.isRequired
  };
}
