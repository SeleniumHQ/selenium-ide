import React from "react";
import Modal from "../Modal";
import RemoveButton from "../ActionButtons/Remove";
import FlatButton from "../FlatButton";
import SearchBar from "../SearchBar";
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
