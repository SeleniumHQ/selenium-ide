import React from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import FlatButton from "../FlatButton";
import "./style.css";

export default class RenameDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRenaming: !!props.value,
      value: props.value ? props.value : ""
    };
  }
  static propTypes = {
    value: PropTypes.string
  };
  handleChange(e) {
    this.setState({
      value: e.target.value
    });
  }
  render() {
    return (
      <Modal className="rename-dialog" isOpen={this.props.isEditing}>
        <h2>{this.state.isRenaming ? `Rename '${this.props.value}'` : "Create New"}</h2>
        <input type="text" value={this.state.value} onChange={this.handleChange.bind(this)} />
        <hr />
        <span className="right">
          <FlatButton onClick={this.props.cancel}>Cancel</FlatButton>
          <FlatButton className="primary" disabled={!this.state.value} onClick={() => {this.props.setValue(this.state.value);}} style={{
            marginRight: "0"
          }}>{this.state.isRenaming ? "Rename" : "Create"}</FlatButton>
        </span>
        <div className="clear"></div>
      </Modal>
    );
  }
}
