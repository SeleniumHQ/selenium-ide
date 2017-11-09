import React, { Component } from "react";
import PropTypes from "prop-types";
import { PropTypes as MobxPropTypes } from "mobx-react";
import { observer } from "mobx-react";
import classNames from "classnames";
import Test, { DraggableTest } from "../Test";
import UiState from "../../stores/view/UiState";
import PlaybackState from "../../stores/view/PlaybackState";
import "./style.css";

@observer 
export default class TestList extends Component {
  render() {
    return (
      <ul className={classNames("tests", {"active": !this.props.collapsed})}>
        {this.props.tests.map((test) => (
          <li key={test.id}>
            {this.props.suite ?
              <DraggableTest
                className={PlaybackState.currentRunningSuite === this.props.suite.id ? PlaybackState.testState.get(test.id) : ""}
                test={test}
                suite={this.props.suite}
                selected={UiState.selectedTest.test && test.id === UiState.selectedTest.test.id && this.props.suite.id === (UiState.selectedTest.suite ? UiState.selectedTest.suite.id : undefined)}
                selectTest={UiState.selectTest}
                dragInProgress={UiState.dragInProgress}
                setDrag={UiState.setDrag}
                removeTest={() => { this.props.removeTest(test); }}
              /> :
              <Test
                className={!PlaybackState.currentRunningSuite && PlaybackState.testState.get(test.id)}
                test={test}
                selected={UiState.selectedTest.test && test.id === UiState.selectedTest.test.id}
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
    suite: PropTypes.object,
    rename: PropTypes.func,
    removeTest: PropTypes.func.isRequired
  };
}
