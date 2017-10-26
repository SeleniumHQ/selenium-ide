import React from "react";
import Modal from "../Modal";
import RemoveButton from "../ActionButtons/Remove";
import FlatButton from "../FlatButton";
import SearchBar from "../SearchBar";
import Checkbox from "../Checkbox";
import "./style.css";

export default class TestSelector extends React.Component {
  render() {
    return (
      <Modal className="test-selector" isOpen={true}>
        <span className="header">
          <h2>Select Tests</h2>
          <RemoveButton />
        </span>
        <SearchBar />
        <TestSelectorList tests={this.props.tests} />
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
  render() {
    return (
      <ul>
        {this.props.tests.map(test => (
          <li key={test.id}>
            <Checkbox id={test.id} label={test.name} />
          </li>
        ))}
      </ul>
    );
  }
}
