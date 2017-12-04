import React, { Component } from "react";
import PropTypes from "prop-types";
import { PropTypes as MobxPropTypes, inject } from "mobx-react";
import { observer } from "mobx-react";
import classNames from "classnames";
import Test, { DraggableTest } from "../Test";
import UiState from "../../stores/view/UiState";
import PlaybackState from "../../stores/view/PlaybackState";
import "./style.css";

@inject("renameTest") @observer
export default class TestList extends Component {
  render() {
    return (
      <ul className={classNames("tests", {"active": !this.props.collapsed})}>
        {this.props.tests.map((test, index) => (
          <li key={test.id}>
            {this.props.suite ?
              <DraggableTest
                className={PlaybackState.testState.get(test.id)}
                test={test}
                suite={this.props.suite}
                selected={UiState.selectedTest.test && test.id === UiState.selectedTest.test.id && this.props.suite.id === (UiState.selectedTest.suite ? UiState.selectedTest.suite.id : undefined)}
                changed={UiState.getTestState(test).modified}
                selectTest={UiState.selectTest}
                dragInProgress={UiState.dragInProgress}
                setDrag={UiState.setDrag}
                removeTest={() => { this.props.removeTest(test); }}
                moveSelectionUp={() => { UiState.selectTestByIndex(index - 1, this.props.suite); }}
                moveSelectionDown={() => { UiState.selectTestByIndex(index + 1, this.props.suite); }}
                setSectionFocus={UiState.setSectionFocus}
              /> :
              <Test
                className={PlaybackState.testState.get(test.id)}
                test={test}
                selected={UiState.selectedTest.test && test.id === UiState.selectedTest.test.id}
                changed={UiState.getTestState(test).modified}
                selectTest={UiState.selectTest}
                renameTest={this.props.renameTest}
                removeTest={() => { this.props.removeTest(test); }}
                moveSelectionUp={() => { UiState.selectTestByIndex(index - 1); }}
                moveSelectionDown={() => { UiState.selectTestByIndex(index + 1); }}
                setSectionFocus={UiState.setSectionFocus}
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
    renameTest: PropTypes.func,
    removeTest: PropTypes.func.isRequired
  };
}
