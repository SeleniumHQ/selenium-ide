import React from "react";
import PropTypes from "prop-types";
import TabBar from "../../components/TabBar";
import SearchBar from "../../components/SearchBar";
import SuiteList from "../../components/SuiteList";
import Runs from "../../components/Runs";
import "./style.css";

export default class Navigation extends React.Component {
  static propTypes = {
    suites: PropTypes.array.isRequired,
    selectedTest: PropTypes.string,
    selectTest: PropTypes.func.isRequired,
    moveTest: PropTypes.func.isRequired
  };
  render() {
    return (
      <aside className="test-cases" style={{
        maxWidth: "200px"
      }}>
        <TabBar tabs={["Tests", "Suites"]} />
        <SearchBar />
        <SuiteList suites={this.props.suites} selectedTest={this.props.selectedTest} selectTest={this.props.selectTest} moveTest={this.props.moveTest} />
        <Runs />
      </aside>
    );
  }
}
