import React from "react";
import PropTypes from "prop-types";
import { PropTypes as MobxPropTypes } from "mobx-react";
import Modal from "../Modal";
import RemoveButton from "../ActionButtons/Remove";
import FlatButton from "../FlatButton";
import SearchBar from "../SearchBar";
import Checkbox from "../Checkbox";
import "./style.css";

export default class TestSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTests: {}
    };
    this.selectTest = this.selectTest.bind(this);
  }
  static propTypes = {
    tests: MobxPropTypes.arrayOrObservableArray.isRequired
  };
  selectTest(isSelected, test) {
    this.setState({
      selectedTests: { ...this.state.selectedTests, [test.id]: isSelected ? test : undefined}
    });
  }
  render() {
    return (
      <Modal className="test-selector" isOpen={true}>
        <span className="header">
          <h2>Select Tests</h2>
          <RemoveButton />
        </span>
        <SearchBar />
        <TestSelectorList tests={this.props.tests} selectedTests={this.state.selectedTests} selectTest={this.selectTest} />
        <hr />
        <span className="right">
          <FlatButton>Cancel</FlatButton>
          <FlatButton className="primary" style={{
            marginRight: "0"
          }}>Add</FlatButton>
        </span>
        <div className="clear"></div>
      </Modal>
    );
  }
}

class TestSelectorList extends React.Component {
  static propTypes = {
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    selectedTests: PropTypes.object.isRequired,
    selectTest: PropTypes.func.isRequired
  };
  handleChange(test, e) {
    this.props.selectTest(e.target.checked, test);
  }
  render() {
    return (
      <ul>
        {this.props.tests.map(test => (
          <li key={test.id}>
            <Checkbox id={test.id} label={test.name} checked={!!this.props.selectedTests[test.id]} onChange={this.handleChange.bind(this, test)} />
          </li>
        ))}
      </ul>
    );
  }
}
