import React from "react";
import Modal from "../Modal";
import RemoveButton from "../ActionButtons/Remove";
import FlatButton from "../FlatButton";
import "./style.css";

export default class TestSelector extends React.Component {
  render() {
    return (
      <Modal className="test-selector" isOpen={true}>
        <span className="header">
          <h2>Select Tests</h2>
          <RemoveButton />
        </span>
        <hr />
        <span className="buttons">
          <FlatButton>Cancel</FlatButton>
          <FlatButton className="primary">Add</FlatButton>
        </span>
      </Modal>
    );
  }
}
