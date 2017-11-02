import React from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import FlatButton from "../FlatButton";
import "./style.css";

export default class Alert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      options: {}
    };
    this.show = this.show.bind(this);
    this.props.show(this.show);
  }
  static propTypes = {
    show: PropTypes.func.isRequired
  };
  show(options, cb) {
    this.setState({
      isOpen: true,
      options,
      cb
    });
  }
  close(status) {
    this.setState({
      isOpen: false
    });
    this.state.cb(status);
  }
  render() {
    return (
      <Modal className="alert" isOpen={this.state.isOpen} onRequestClose={this.close.bind(this, false)}>
        <h2>{this.state.options.title}</h2>
        <p>{this.state.options.description}</p>
        <hr />
        <span className="right">
          <FlatButton onClick={this.close.bind(this, false)}>{this.state.options.cancelLabel}</FlatButton>
          <FlatButton className="danger" onClick={this.close.bind(this, true)}>{this.state.options.confirmLabel}</FlatButton>
        </span>
        <div className="clear"></div>
      </Modal>
    );
  }
}
