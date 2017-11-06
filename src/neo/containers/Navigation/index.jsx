import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { PropTypes as MobxPropTypes } from "mobx-react";
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
    removeSuite: PropTypes.func.isRequired,
    moveTest: PropTypes.func.isRequired
  };
  handleChangedTab(tab) {
    this.setState({
      showTests: tab === "Tests"
    });
  }
  render() {
    return (
      <aside className="test-cases">
        <TabBar tabs={["Tests", "Suites"]} tabChanged={this.handleChangedTab}>
          <AddButton onClick={this.state.showTests ? ModalState.createTest : ModalState.createSuite} />
        </TabBar>
        <SearchBar filter={UiState.changeFilter} />
        { this.state.showTests
          ? <TestList tests={this.props.tests} rename={ModalState.rename} removeTest={ModalState.deleteTest} />
          : <SuiteList suites={this.props.suites} rename={ModalState.rename} selectTests={ModalState.editSuite} removeSuite={this.props.removeSuite} moveTest={this.props.moveTest} /> }
        <Runs
          runs={PlaybackState.runs}
          failures={PlaybackState.failures}
          hasFailures={PlaybackState.hasFailed}
          progress={PlaybackState.finishedCommandsCount}
          totalProgress={PlaybackState.commandsCount}
        />
      </aside>
    );
  }
}
