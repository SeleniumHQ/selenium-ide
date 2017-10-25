import React from "react";
import PropTypes from "prop-types";
import ReactModal from "react-modal";
import FlatButton from "../FlatButton";
import "./style.css";

export default class Alert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true
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
        className="alert-content"
        isOpen={this.state.isOpen}
        ariaHideApp={false}
        shouldCloseOnOverlayClick={true}
        onRequestClose={this.close.bind(this, false)}
      >
        <div className="alert">
          <h2>Night Run</h2>
          <p>This will permanently delete `Night Run`</p>
          <hr />
          <span className="buttons">
            <FlatButton onClick={this.close.bind(this, false)}>cancel</FlatButton>
            <FlatButton className="danger" onClick={this.close.bind(this, true)}>delete</FlatButton>
          </span>
          <div className="clear"></div>
        </div>
      </ReactModal>
    );
  }
}
