import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { PropTypes as MobxPropTypes } from "mobx-react";
import UiState from "../../stores/view/UiState";
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
    rename: PropTypes.func,
    createSuite: PropTypes.func.isRequired,
    removeSuite: PropTypes.func.isRequired,
    createTest: PropTypes.func.isRequired,
    moveTest: PropTypes.func.isRequired,
    deleteTest: PropTypes.func.isRequired
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
          <AddButton onClick={this.state.showTests ? this.props.createTest : this.props.createSuite} />
        </TabBar>
        <SearchBar filter={UiState.changeFilter} />
        { this.state.showTests
          ? <TestList tests={this.props.tests} rename={this.props.rename} removeTest={this.props.deleteTest} />
          : <SuiteList suites={this.props.suites} rename={this.props.rename} selectTests={UiState.editSuite} removeSuite={this.props.removeSuite} moveTest={this.props.moveTest} /> }
        <Runs />
      </aside>
    );
  }
}
