import React from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import ModalHeader from "../ModalHeader";
import FlatButton from "../FlatButton";

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
    }, () => {
      this.submit.focus();
    });
  }
  close(status) {
    this.setState({
      isOpen: false
    });
    if (this.state.cb) this.state.cb(status);
  }
  render() {
    return (
      <Modal className="alert" isOpen={this.state.isOpen} onRequestClose={this.close.bind(this, false)}>
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <ModalHeader title={this.state.options.title} close={this.close.bind(this, false)} />
          <p>{this.state.options.description}</p>
          <span className="right">
            {this.state.options.cancelLabel ? <FlatButton onClick={this.close.bind(this, false)}>{this.state.options.cancelLabel}</FlatButton> : null}
            <FlatButton type="submit" buttonRef={(submit) => { this.submit = submit; }} onClick={this.close.bind(this, true)}>{this.state.options.confirmLabel}</FlatButton>
          </span>
          <div className="clear"></div>
        </form>
      </Modal>
    );
  }
}
