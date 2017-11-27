import React from "react";
import PropTypes from "prop-types";
import { observer, Provider } from "mobx-react";
import { PropTypes as MobxPropTypes } from "mobx-react";
import { modifier } from "modifier-keys";
import UiState from "../../stores/view/UiState";
import ModalState from "../../stores/view/ModalState";
import PlaybackState from "../../stores/view/PlaybackState";
import TabBar from "../../components/TabBar";
import SearchBar from "../../components/SearchBar";
import TestList from "../../components/TestList";
import SuiteList from "../../components/SuiteList";
import Runs from "../../components/Runs";
import AddButton from "../../components/ActionButtons/Add";
import "./style.css";

@observer export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTests: true
    };
    this.handleChangedTab = this.handleChangedTab.bind(this);
  }
  static propTypes = {
    suites: MobxPropTypes.arrayOrObservableArray.isRequired,
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    moveTest: PropTypes.func.isRequired
  };
  handleChangedTab(tab) {
    this.setState({
      showTests: tab === "Tests"
    });
  }
  handleKeyDown(event) {
    const e = event.nativeEvent;
    modifier(e);
    const noModifiers = (!e.primaryKey && !e.secondaryKey);

    if (e.target.localName !== "input" && noModifiers && e.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();
      UiState.focusEditor();
    }
  }
  render() {
    return (
      <aside className="test-cases" onKeyDown={this.handleKeyDown.bind(this)}>
        <TabBar tabs={["Tests", "Suites"]} tabWidth={70} tabChanged={this.handleChangedTab}>
          <AddButton data-tooltip={this.state.showTests ? "Add test case" : "Add suite"} onClick={this.state.showTests ? ModalState.createTest : ModalState.createSuite} />
        </TabBar>
        <SearchBar value={UiState.filterTerm} filter={UiState.changeFilter} />
        <Provider renameTest={ModalState.renameTest}>
          { this.state.showTests
            ? <TestList tests={this.props.tests} removeTest={ModalState.deleteTest} />
            : <SuiteList suites={this.props.suites} rename={ModalState.renameSuite} selectTests={ModalState.editSuite} removeSuite={ModalState.deleteSuite} moveTest={this.props.moveTest} /> }
        </Provider>
        <Runs
          runs={PlaybackState.runs}
          failures={PlaybackState.failures}
          hasError={PlaybackState.hasFailed}
          progress={PlaybackState.finishedCommandsCount}
          totalProgress={PlaybackState.commandsCount}
        />
      </aside>
    );
  }
}
