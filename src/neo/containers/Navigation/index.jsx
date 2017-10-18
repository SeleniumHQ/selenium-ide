import React from "react";
import PropTypes from "prop-types";
import TabBar from "../../components/TabBar";
import SearchBar from "../../components/SearchBar";
import TestList from "../../components/TestList";
import SuiteList from "../../components/SuiteList";
import Runs from "../../components/Runs";
import "./style.css";

export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTests: true
    };
    this.handleChangedTab = this.handleChangedTab.bind(this);
  }
  static propTypes = {
    suites: PropTypes.array.isRequired,
    tests: PropTypes.array.isRequired,
    moveTest: PropTypes.func.isRequired
  };
  handleChangedTab(tab) {
    this.setState({
      showTests: tab === "Tests"
    });
  }
  render() {
    return (
      <aside className="test-cases" style={{
        maxWidth: "200px"
      }}>
        <TabBar tabs={["Tests", "Suites"]} tabChanged={this.handleChangedTab} />
        <SearchBar />
        { this.state.showTests
          ? <TestList tests={this.props.tests} />
          : <SuiteList suites={this.props.suites} moveTest={this.props.moveTest} /> }
        <Runs />
      </aside>
    );
  }
}
