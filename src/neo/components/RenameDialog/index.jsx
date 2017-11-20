import React from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import ModalHeader from "../ModalHeader";
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
  handleChange(e) {
    this.setState({
      value: e.target.value
    });
  }
  render() {
    return (
      <Modal className="rename-dialog" isOpen={this.props.isEditing}>
        <ModalHeader title={`${this.state.isRenaming ? "Rename" : "Create New"} ${this.props.type}`} close={this.props.cancel} />
        <input type="text" value={this.state.value} onChange={this.handleChange.bind(this)} />
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
  static propTypes = {
    isEditing: PropTypes.bool,
    value: PropTypes.string,
    cancel: PropTypes.func,
    setValue: PropTypes.func
  };
}
