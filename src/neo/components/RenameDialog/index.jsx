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
      value: props.value ? props.value : "",
      type: props.type
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.type) {
      this.setState({
        isRenaming: !!nextProps.value,
        value: nextProps.value ? nextProps.value : "",
        type: nextProps.type
      });
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.input.focus();
    }
  }
  handleChange(e) {
    this.setState({
      value: e.target.value
    });
  }
  render() {
    return (
      <Modal className="rename-dialog" isOpen={this.props.isEditing}>
        <form>
          <ModalHeader title={`${this.state.isRenaming ? "Rename" : "Create New"} ${this.state.type}`} close={this.props.cancel} />
          <input ref={(input) => { this.input = input; }} type="text" value={this.state.value} onChange={this.handleChange.bind(this)} />
          <span className="right">
            <FlatButton type="submit" disabled={!this.state.value} onClick={() => {this.props.setValue(this.state.value);}} style={{
              marginRight: "0"
            }}>{this.state.isRenaming ? "Rename" : "Create"}</FlatButton>
            <FlatButton onClick={this.props.cancel}>Cancel</FlatButton>
          </span>
          <div className="clear"></div>
        </form>
      </Modal>
    );
  }
  static propTypes = {
    isEditing: PropTypes.bool,
    type: PropTypes.string,
    value: PropTypes.string,
    cancel: PropTypes.func,
    setValue: PropTypes.func
  };
}
