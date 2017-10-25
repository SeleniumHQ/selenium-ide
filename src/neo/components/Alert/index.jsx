import React from "react";
import PropTypes from "prop-types";
import ReactModal from "react-modal";

export default class Alert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.show = this.show.bind(this);
    this.props.show(this.show);
  }
  static propTypes = {
    show: PropTypes.func.isRequired
  };
  show(cb) {
    this.setState({
      isOpen: true,
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
      <ReactModal
        isOpen={this.state.isOpen}
        ariaHideApp={false}
        shouldCloseOnOverlayClick={true}
        onRequestClose={this.close.bind(this, false)}
      >
        <h1>alert</h1>
        <button onClick={this.close.bind(this, true)}>true</button>
      </ReactModal>
    );
  }
}
